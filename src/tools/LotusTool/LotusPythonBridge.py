#!/usr/bin/env python3
"""
Lotus Python Bridge - Enhanced Version
Interfaces between Node.js and the Python Lotus library for natural language data analysis
with improved semantic operations and code analysis capabilities
"""

import sys
import json
import os
import traceback
import pandas as pd
import numpy as np
from pathlib import Path
import glob
import re
from typing import Dict, List, Any, Union

# Try importing the lotus library
try:
    import lotus_ai as lotus
    from lotus_ai import settings
    from lotus_ai.sem_ops import sem_search, sem_filter, sem_join, sem_map
    from lotus_ai.sem_ops import sem_cluster_by, sem_agg, sem_topk, sem_dedup
    LOTUS_AVAILABLE = True
except ImportError:
    LOTUS_AVAILABLE = False
    print(json.dumps({"status": "error", "message": "Lotus library not installed. Install with: pip install lotus-ai"}))
    sys.exit(1)

def setup_lotus():
    """Configure Lotus with available API keys"""
    if not LOTUS_AVAILABLE:
        return {"status": "error", "message": "Lotus library not available"}
    
    try:
        # Configure Lotus with available API key
        api_key = os.environ.get('LOTUS_API_KEY') or os.environ.get('OPENAI_API_KEY')
        if not api_key:
            return {"status": "error", "message": "No API key found in LOTUS_API_KEY or OPENAI_API_KEY environment variables"}
        
        os.environ['OPENAI_API_KEY'] = api_key
        
        # Configure Lotus with GPT-4 for better semantic understanding
        settings.configure(
            lm="openai/gpt-4",
            helper_lm="openai/gpt-3.5-turbo"
        )
        
        return {"status": "ok", "message": "Lotus configured successfully"}
    except Exception as e:
        return {"status": "error", "message": f"Error configuring Lotus: {str(e)}"}

def load_data(data_path: str, data_source: str = None) -> Union[pd.DataFrame, Dict]:
    """
    Load data from various sources into a pandas DataFrame
    Enhanced to handle code files, directories, and multiple file types
    """
    try:
        if not data_path:
            return {"status": "error", "message": "No data path provided"}
            
        path = Path(data_path)
        if not path.exists():
            return {"status": "error", "message": f"Path not found: {data_path}"}
        
        # Handle directory - load code files into a text dataset
        if path.is_dir():
            code_files = []
            for ext in ['.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.cpp', '.c', '.h', '.json', '.md', '.html', '.css']:
                code_files.extend(glob.glob(f"{data_path}/**/*{ext}", recursive=True))
            
            if not code_files:
                return {"status": "error", "message": f"No code files found in directory: {data_path}"}
                
            # Read all files and create a DataFrame of code snippets
            records = []
            for file in code_files[:100]:  # Limit to 100 files to avoid memory issues
                try:
                    rel_path = os.path.relpath(file, data_path)
                    with open(file, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        # Split into chunks to keep manageable
                        chunks = [content[i:i+1000] for i in range(0, len(content), 1000)]
                        for i, chunk in enumerate(chunks):
                            records.append({
                                'file_path': rel_path,
                                'file_type': os.path.splitext(file)[1][1:],
                                'chunk_id': i,
                                'content': chunk
                            })
                except Exception as file_error:
                    print(f"Error reading file {file}: {str(file_error)}")
            
            if not records:
                return {"status": "error", "message": "Failed to read any files in the directory"}
                
            return pd.DataFrame(records)
        
        # Standard data file handling
        if data_source:
            # Use explicit data source format if provided
            if data_source.lower() == 'csv':
                return pd.read_csv(data_path)
            elif data_source.lower() in ('excel', 'xls', 'xlsx'):
                return pd.read_excel(data_path)
            elif data_source.lower() == 'json':
                return pd.read_json(data_path)
            elif data_source.lower() == 'txt':
                # For text files, create a DataFrame with lines and line numbers
                with open(data_path, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
                return pd.DataFrame({'line_number': range(1, len(lines)+1), 'text': lines})
        
        # Auto-detect based on file extension
        if path.suffix.lower() == '.csv':
            return pd.read_csv(data_path)
        elif path.suffix.lower() in ('.xls', '.xlsx'):
            return pd.read_excel(data_path)
        elif path.suffix.lower() == '.json':
            return pd.read_json(data_path)
        elif path.suffix.lower() in ('.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.cpp', '.c', '.h'):
            # Code file - read and create a DataFrame with line numbers
            with open(data_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            return pd.DataFrame({
                'line_number': range(1, len(lines)+1),
                'code': lines,
                'file': os.path.basename(data_path)
            })
        elif path.suffix.lower() in ('.txt', '.md', '.html', '.css'):
            # Text file - read and create a DataFrame with line numbers
            with open(data_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
            return pd.DataFrame({
                'line_number': range(1, len(lines)+1),
                'text': lines,
                'file': os.path.basename(data_path)
            })
        else:
            # Unknown format - try to read as CSV first, then text
            try:
                return pd.read_csv(data_path)
            except:
                try:
                    with open(data_path, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = f.readlines()
                    return pd.DataFrame({'line_number': range(1, len(lines)+1), 'text': lines})
                except:
                    return {"status": "error", "message": f"Unsupported file format: {data_path}"}
    except Exception as e:
        return {"status": "error", "message": f"Error loading data: {str(e)}"}

def analyze_with_lotus(query: str, df: pd.DataFrame, semantic_search: bool = True) -> Dict:
    """
    Analyze data using Lotus with enhanced semantic capabilities
    Optimized for code and text analysis
    """
    try:
        # Get column info for display
        cols = df.columns.tolist()
        row_count = len(df)
        data_types = {col: str(df[col].dtype) for col in cols}
        
        # Detect if this is a code or text DataFrame
        is_code_df = 'code' in cols or 'content' in cols or any('file' in col.lower() for col in cols)
        
        # Choose the appropriate text column for semantic operations
        text_column = None
        if 'code' in cols:
            text_column = 'code'
        elif 'content' in cols:
            text_column = 'content'
        elif 'text' in cols:
            text_column = 'text'
        else:
            # Find the first object column that might contain text
            for col in cols:
                if df[col].dtype == 'object' and df[col].str.len().mean() > 20:
                    text_column = col
                    break
        
        # If we can't find a suitable text column, return an error
        if not text_column and semantic_search:
            return {
                "status": "error",
                "message": "No suitable text column found for semantic analysis"
            }
        
        # Use Lotus' semantic operations
        if semantic_search and text_column:
            # Try different semantic operations based on the query type
            query_lower = query.lower()
            
            if any(term in query_lower for term in ['search', 'find', 'where', 'similar', 'like']):
                # Semantic search
                try:
                    search_accessor = sem_search.SemSearchDataframe(df)
                    result_df = search_accessor(text_column, query, K=min(10, len(df)))
                    
                    return {
                        "status": "ok",
                        "operation": "semantic_search",
                        "results": result_df.to_dict(orient="records"),
                        "search_column": text_column,
                        "query": query,
                        "message": "Found content semantically related to your query",
                        "data_info": {
                            "columns": cols,
                            "row_count": len(result_df),
                            "total_rows": row_count,
                            "data_types": data_types
                        }
                    }
                except Exception as search_error:
                    print(f"Semantic search error: {str(search_error)}")
            
            elif any(term in query_lower for term in ['filter', 'only', 'exclude']):
                # Semantic filtering
                try:
                    filter_accessor = sem_filter.SemFilterDataframe(df)
                    filtered_df = filter_accessor(text_column, query)
                    
                    if len(filtered_df) > 0:
                        return {
                            "status": "ok",
                            "operation": "semantic_filter",
                            "results": filtered_df.to_dict(orient="records"),
                            "filter_column": text_column,
                            "query": query,
                            "message": f"Filtered data based on semantic meaning. Found {len(filtered_df)} matches.",
                            "data_info": {
                                "columns": cols,
                                "row_count": len(filtered_df),
                                "total_rows": row_count,
                                "data_types": data_types
                            }
                        }
                except Exception as filter_error:
                    print(f"Semantic filter error: {str(filter_error)}")
            
            elif any(term in query_lower for term in ['cluster', 'group', 'categorize']):
                # Semantic clustering
                try:
                    if hasattr(sem_cluster_by, 'SemClusterByDataframe'):
                        cluster_accessor = sem_cluster_by.SemClusterByDataframe(df)
                        n_clusters = min(5, len(df))
                        clustered_df = cluster_accessor(text_column, n_clusters=n_clusters)
                        
                        # Get representative examples from each cluster
                        clusters = []
                        for i in range(n_clusters):
                            cluster_df = clustered_df[clustered_df['cluster'] == i]
                            if len(cluster_df) > 0:
                                clusters.append({
                                    'cluster_id': i,
                                    'size': len(cluster_df),
                                    'examples': cluster_df.head(3).to_dict(orient="records")
                                })
                        
                        return {
                            "status": "ok",
                            "operation": "semantic_clustering",
                            "clusters": clusters,
                            "results": clustered_df.to_dict(orient="records"),
                            "message": f"Clustered data into {n_clusters} semantic groups",
                            "data_info": {
                                "columns": cols,
                                "row_count": row_count,
                                "data_types": data_types
                            }
                        }
                except Exception as cluster_error:
                    print(f"Semantic clustering error: {str(cluster_error)}")
            
            elif any(term in query_lower for term in ['extract', 'pull', 'get']):
                # Semantic extraction
                try:
                    if hasattr(sem_map, 'SemMapDataframe'):
                        map_accessor = sem_map.SemMapDataframe(df)
                        # Extract what the query is asking for
                        extracted_df = map_accessor(text_column, query)
                        
                        return {
                            "status": "ok",
                            "operation": "semantic_extraction",
                            "results": extracted_df.to_dict(orient="records"),
                            "query": query,
                            "message": "Extracted information based on semantic understanding",
                            "data_info": {
                                "columns": extracted_df.columns.tolist(),
                                "row_count": len(extracted_df),
                                "data_types": {col: str(extracted_df[col].dtype) for col in extracted_df.columns}
                            }
                        }
                except Exception as extract_error:
                    print(f"Semantic extraction error: {str(extract_error)}")
            
            # If we haven't returned yet, try a general semantic search as fallback
            try:
                search_accessor = sem_search.SemSearchDataframe(df)
                result_df = search_accessor(text_column, query, K=min(10, len(df)))
                
                return {
                    "status": "ok",
                    "operation": "semantic_search_fallback",
                    "results": result_df.to_dict(orient="records"),
                    "search_column": text_column,
                    "query": query,
                    "message": "Found content related to your query using semantic search",
                    "data_info": {
                        "columns": cols,
                        "row_count": len(result_df),
                        "total_rows": row_count,
                        "data_types": data_types
                    }
                }
            except Exception as fallback_error:
                print(f"Semantic fallback search error: {str(fallback_error)}")
        
        # If semantic operations failed or weren't requested, fall back to basic approach
        # For code/text data, try basic text search
        if is_code_df and text_column:
            # Use regex to find matches
            search_terms = [term for term in query.lower().split() if len(term) > 3]
            if not search_terms:
                search_terms = query.lower().split()
            
            pattern = '|'.join(search_terms)
            try:
                matches = df[df[text_column].str.lower().str.contains(pattern, na=False, regex=True)]
                
                if len(matches) > 0:
                    return {
                        "status": "ok",
                        "operation": "text_search",
                        "results": matches.to_dict(orient="records"),
                        "query": query,
                        "message": f"Found {len(matches)} text matches for your query",
                        "data_info": {
                            "columns": cols,
                            "row_count": len(matches),
                            "total_rows": row_count,
                            "data_types": data_types
                        }
                    }
            except Exception as regex_error:
                print(f"Regex search error: {str(regex_error)}")
        
        # For regular data, try basic filtering
        try:
            # Find numeric columns for filtering
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            
            # Check for comparison operations in the query
            comparisons = re.findall(r'(\w+)\s*(>|<|>=|<=|==|!=)\s*(\d+(?:\.\d+)?)', query)
            filtered_df = df.copy()
            
            if comparisons:
                for col, op, val in comparisons:
                    if col in numeric_cols:
                        val = float(val)
                        if op == '>':
                            filtered_df = filtered_df[filtered_df[col] > val]
                        elif op == '<':
                            filtered_df = filtered_df[filtered_df[col] < val]
                        elif op == '>=':
                            filtered_df = filtered_df[filtered_df[col] >= val]
                        elif op == '<=':
                            filtered_df = filtered_df[filtered_df[col] <= val]
                        elif op == '==':
                            filtered_df = filtered_df[filtered_df[col] == val]
                        elif op == '!=':
                            filtered_df = filtered_df[filtered_df[col] != val]
                
                if len(filtered_df) < len(df):
                    return {
                        "status": "ok",
                        "operation": "numeric_filter",
                        "results": filtered_df.to_dict(orient="records"),
                        "query": query,
                        "message": f"Filtered data based on numeric conditions. Found {len(filtered_df)} matches.",
                        "data_info": {
                            "columns": cols,
                            "row_count": len(filtered_df),
                            "total_rows": row_count,
                            "data_types": data_types
                        }
                    }
        except Exception as basic_filter_error:
            print(f"Basic filter error: {str(basic_filter_error)}")
        
        # If all else fails, return a data preview
        return {
            "status": "ok",
            "operation": "preview",
            "results": df.head(10).to_dict(orient="records"),
            "query": query,
            "message": "Showing data preview. Try a more specific query for semantic analysis.",
            "data_info": {
                "columns": cols,
                "row_count": row_count,
                "data_types": data_types,
                "preview_size": min(10, row_count)
            }
        }
            
    except Exception as e:
        traceback_str = traceback.format_exc()
        return {
            "status": "error", 
            "message": str(e),
            "traceback": traceback_str
        }

def process_query(args: Dict) -> Dict:
    """Process a query using Lotus with advanced semantic capabilities"""
    # Check if Lotus is available
    if not LOTUS_AVAILABLE:
        return {"status": "error", "message": "Lotus library not available"}
    
    # Setup Lotus
    setup_result = setup_lotus()
    if setup_result["status"] != "ok":
        return setup_result
    
    try:
        # Required parameters
        query = args.get("query")
        data_path = args.get("data_path")
        
        if not query:
            return {"status": "error", "message": "No query provided"}
            
        if not data_path:
            return {"status": "error", "message": "No data path provided"}
        
        # Optional parameters
        data_source = args.get("data_source")
        semantic_search = args.get("semantic_search", True)  # Enable by default
        
        # Load data
        print(f"Loading data from: {data_path}")
        data_result = load_data(data_path, data_source)
        if isinstance(data_result, dict) and "status" in data_result:
            return data_result  # Return error if data loading failed
        
        # Analyze with Lotus
        print(f"Analyzing data with query: {query}")
        analysis_result = analyze_with_lotus(query, data_result, semantic_search)
        
        return analysis_result
    except Exception as e:
        traceback_str = traceback.format_exc()
        return {"status": "error", "message": str(e), "traceback": traceback_str}

if __name__ == "__main__":
    try:
        # Parse arguments
        if len(sys.argv) != 2:
            print(json.dumps({"status": "error", "message": "Expected exactly one JSON argument"}))
            sys.exit(1)
        
        args = json.loads(sys.argv[1])
        
        # Test mode
        if "test" in args and args["test"]:
            print(json.dumps({
                "status": "ok", 
                "message": "Lotus Python bridge is operational", 
                "lotus_available": LOTUS_AVAILABLE,
                "version": "2.0.0"
            }))
            sys.exit(0)
        
        # Process query
        if "analyze_data" in args and args["analyze_data"] or "query" in args:
            result = process_query(args)
            print(json.dumps(result))
        else:
            print(json.dumps({"status": "error", "message": "No valid command specified"}))
    
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)