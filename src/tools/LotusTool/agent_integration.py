#!/usr/bin/env python3
"""
Agent Integration for Lotus and Search Tools
This script combines code search (grep) and natural language data analysis (Lotus)
"""

import sys
import json
import os
import subprocess
import pandas as pd
import traceback
from pathlib import Path

# Try importing the lotus library
try:
    import lotus
    from lotus import settings
    from lotus.sem_ops import sem_search, sem_filter, sem_join, sem_map

    LOTUS_AVAILABLE = True
except ImportError:
    LOTUS_AVAILABLE = False

class AgentIntegration:
    def __init__(self):
        """Initialize the agent integration"""
        self.setup_lotus()
        
    def setup_lotus(self):
        """Set up lotus if available"""
        if not LOTUS_AVAILABLE:
            print(json.dumps({"status": "warning", "message": "Lotus library not available. Natural language data analysis will be limited."}))
            return
        
        try:
            # Configure lotus with OpenAI API key
            api_key = os.environ.get('OPENAI_API_KEY')
            if api_key:
                settings.configure(
                    lm="openai/gpt-3.5-turbo-0125",
                    helper_lm="openai/gpt-3.5-turbo-0125"
                )
                print(json.dumps({"status": "ok", "message": "Lotus configured successfully"}))
            else:
                print(json.dumps({"status": "warning", "message": "OPENAI_API_KEY not set. Natural language data analysis will be limited."}))
        except Exception as e:
            print(json.dumps({"status": "warning", "message": f"Error configuring Lotus: {str(e)}"}))
            
    def search_code(self, search_term, directory='.', file_pattern="*.py,*.js,*.ts"):
        """Search code using grep"""
        try:
            # Convert comma-separated patterns to multiple --include arguments
            include_args = ' '.join([f'--include="{pattern}"' for pattern in file_pattern.split(',')])
            
            # Execute grep command
            cmd = f'grep -r "{search_term}" {directory} {include_args}'
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            # Process results
            if result.returncode == 0:
                # Found matches
                matches = result.stdout.strip().split('\n')
                return {"status": "ok", "matches": matches, "count": len(matches)}
            elif result.returncode == 1 and not result.stderr:
                # No matches found (grep returns 1 when no matches)
                return {"status": "ok", "matches": [], "count": 0}
            else:
                # Error occurred
                return {"status": "error", "message": result.stderr}
        except Exception as e:
            return {"status": "error", "message": str(e)}
            
    def analyze_data_with_nl(self, query, data_path):
        """Analyze data using natural language with Lotus"""
        if not LOTUS_AVAILABLE:
            return {"status": "error", "message": "Lotus library not available"}
            
        try:
            # Load data
            if data_path.endswith('.csv'):
                df = pd.read_csv(data_path)
            elif data_path.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(data_path)
            elif data_path.endswith('.json'):
                df = pd.read_json(data_path)
            else:
                return {"status": "error", "message": f"Unsupported file format: {data_path}"}
                
            # Process with natural language query
            # This would ideally use the actual Lotus sem_ops, but we're using a simplified approach
            
            # First check if we can use any semantic operations from Lotus
            try:
                # Display the data information
                cols = df.columns.tolist()
                data_types = {col: str(df[col].dtype) for col in cols}
                
                # Extract description of the data
                data_summary = {
                    "columns": cols,
                    "row_count": len(df),
                    "data_types": data_types,
                    "preview": df.head(3).to_dict(orient="records")
                }
                
                # This is where we would use actual Lotus operations
                # For now, just return the data summary with the query
                nl_analysis_result = {
                    "status": "ok", 
                    "operation": "natural_language_analysis",
                    "query": query,
                    "data_summary": data_summary,
                    "message": "Natural language analysis would process this query on the data."
                }
                
                return nl_analysis_result
                
            except Exception as inner_e:
                # If the above fails, return a basic result
                print(f"Warning: Could not use Lotus operations: {str(inner_e)}")
                return {
                    "status": "partial",
                    "operation": "basic_analysis",
                    "data_summary": {
                        "columns": df.columns.tolist(),
                        "row_count": len(df),
                        "preview": df.head(3).to_dict(orient="records")
                    },
                    "message": "Only basic analysis available. Lotus operations could not be used."
                }
                
        except Exception as e:
            traceback_str = traceback.format_exc()
            return {"status": "error", "message": str(e), "traceback": traceback_str}
            
    def combined_search(self, query, code_path='.', data_path=None, file_pattern="*.py,*.js,*.ts"):
        """Combine code search and natural language data analysis"""
        results = {
            "status": "ok",
            "code_search": None,
            "data_analysis": None
        }
        
        # Search code
        code_results = self.search_code(query, code_path, file_pattern)
        results["code_search"] = code_results
        
        # Analyze data with natural language if path provided
        if data_path and Path(data_path).exists():
            data_results = self.analyze_data_with_nl(query, data_path)
            results["data_analysis"] = data_results
            
        return results

if __name__ == "__main__":
    try:
        # Parse arguments
        if len(sys.argv) != 2:
            print(json.dumps({"status": "error", "message": "Expected exactly one JSON argument"}))
            sys.exit(1)
            
        args = json.loads(sys.argv[1])
        
        # Initialize the agent
        agent = AgentIntegration()
        
        # Process commands
        if "test" in args and args["test"]:
            # Test mode - just return status
            print(json.dumps({
                "status": "ok", 
                "message": "Agent integration initialized successfully",
                "lotus_available": LOTUS_AVAILABLE
            }))
        elif "combined_search" in args and args["combined_search"]:
            # Combined search mode
            results = agent.combined_search(
                query=args.get("query", ""),
                code_path=args.get("code_path", "."),
                data_path=args.get("data_path"),
                file_pattern=args.get("file_pattern", "*.py,*.js,*.ts")
            )
            print(json.dumps(results))
        elif "search_code" in args and args["search_code"]:
            # Code search only
            results = agent.search_code(
                search_term=args.get("query", ""),
                directory=args.get("code_path", "."),
                file_pattern=args.get("file_pattern", "*.py,*.js,*.ts")
            )
            print(json.dumps(results))
        elif "analyze_data" in args and args["analyze_data"]:
            # Data analysis only with natural language
            if not args.get("data_path"):
                print(json.dumps({"status": "error", "message": "data_path is required for data analysis"}))
                sys.exit(1)
                
            results = agent.analyze_data_with_nl(
                query=args.get("query", ""),
                data_path=args.get("data_path")
            )
            print(json.dumps(results))
        else:
            print(json.dumps({"status": "error", "message": "No valid command specified"}))
            
    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)