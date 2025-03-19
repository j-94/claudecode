# Claude Code Feature Evolution

This report analyzes feature implementations across Claude Code versions.

## Version Comparison

| Version | File Size | BatchTool | WebFetch | View | MCP | PermissionSystem | Tool Count | Command Count |
|---------|-----------|----------|----------|----------|----------|----------|------------|---------------|
| 0.2.18 | 4.59 MB | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 4 |
| 0.2.25 | 4.61 MB | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 4 |
| 0.2.30 | 4.61 MB | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 4 |
| 0.2.35 | 5.08 MB | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 5 |
| 0.2.40 | 5.20 MB | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 6 |
| 0.2.45 | 5.22 MB | ❌ | ❌ | ✅ | ✅ | ✅ | 0 | 6 |
| 0.2.49 | 5.23 MB | ❌ | ❌ | ✅ | ✅ | ✅ | 0 | 6 |
| 0.2.9 | 4.56 MB | ❌ | ❌ | ✅ | ❌ | ✅ | 0 | 7 |

## Tool Evolution

| Tool | Original | 0.2.18 | 0.2.25 | 0.2.30 | 0.2.35 | 0.2.40 | 0.2.45 | 0.2.49 | 0.2.9 |
|------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
| AgentTool (Task) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ArchitectTool (Architect) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| BashTool (Bash) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| FileEditTool  | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| FileReadTool (Read) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| FileWriteTool  | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GlobTool (Search) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GrepTool (Search) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| MCPTool  | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| MemoryReadTool (Read Memory) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| MemoryWriteTool (Write Memory) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| NotebookEditTool (Edit Notebook) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| NotebookReadTool (Read Notebook) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| StickerRequestTool  | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ThinkTool  | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| lsTool (List) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## User-Facing Names Evolution

| User-Facing Name | 0.2.18 | 0.2.25 | 0.2.30 | 0.2.35 | 0.2.40 | 0.2.45 | 0.2.49 | 0.2.9 |
|-----------------|----------|----------|----------|----------|----------|----------|----------|----------|
| Architect | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Bash | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Call | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Edit Notebook | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| List | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Read Notebook | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Task | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Web Fetch | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| allowed-tools | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| approved-tools | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| bug | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| clear | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| compact | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| config | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| cost | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| doctor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| exit | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| help | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| init | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| logout | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| mcp | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| onboarding | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| pr-comments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| release-notes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| review | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| terminal-setup | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| theme | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |

## BatchTool Implementation


## WebFetch Implementation


## View Implementation

### Version 0.2.18

```typescript
{CK.name} instead.`;var lg1=3,hg1=262144,bg1=new Set([".png",".jpg",".jpeg",".gif",".bmp",".webp"]),es=2000,ts=2000,jg1=3932160,Vw9=s.strictObject({file_path:s.string().describe("The absolute path to the file to read"),offset:s.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:s.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),DG={name:"View",async description(){return Ug2}

{file_path:s.string().describe("The absolute path to the file to read"),offset:s.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:s.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),DG={name:"View",async description(){return Ug2}
```

### Version 0.2.25

```typescript
{gg.name} instead.`;var Gg1=3,Bg1=262144,Zg1=new Set([".png",".jpg",".jpeg",".gif",".bmp",".webp"]),Co=2000,Vo=2000,dg1=3932160,Bw9=s.strictObject({file_path:s.string().describe("The absolute path to the file to read"),offset:s.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:s.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),FZ={name:"View",async description(){return dg2}

{file_path:s.string().describe("The absolute path to the file to read"),offset:s.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:s.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),FZ={name:"View",async description(){return dg2}
```

### Version 0.2.30

```typescript
{EX.name} instead.`;var Kg1=3,Qg1=262144,gg1=new Set([".png",".jpg",".jpeg",".gif",".bmp",".webp"]),qo=2000,Uo=2000,Ng1=3932160,lw9=o.strictObject({file_path:o.string().describe("The absolute path to the file to read"),offset:o.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:o.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),MI={name:"View",async description(){return Qg2}

{file_path:o.string().describe("The absolute path to the file to read"),offset:o.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:o.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),MI={name:"View",async description(){return Qg2}
```

### Version 0.2.35

```typescript
{YV.name} instead.`;var ag1=3,eg1=262144,rg1=new Set([".png",".jpg",".jpeg",".gif",".bmp",".webp"]),F11=2000,J11=2000,sg1=3932160,Kq3=e.strictObject({file_path:e.string().describe("The absolute path to the file to read"),offset:e.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:e.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),_G={name:"View",async description(){return Fv2}

{file_path:e.string().describe("The absolute path to the file to read"),offset:e.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:e.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),_G={name:"View",async description(){return Fv2}
```

### Version 0.2.40

```typescript
{return I.length/4}var _f1=3,a01=262144,Df1=20000,i01=new Set([".png",".jpg",".jpeg",".gif",".bmp",".webp"]),c01=2000,p01=2000,Hf1=3932160,FE3=G1.strictObject({file_path:G1.string().describe("The absolute path to the file to read"),offset:G1.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:G1.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),AW={name:"View",async description(){return Nv2}

{file_path:G1.string().describe("The absolute path to the file to read"),offset:G1.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:G1.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),AW={name:"View",async description(){return Nv2}
```

### Version 0.2.45

```typescript
{return I.length/4}var qf1=3,W21=262144,gf1=20000,Z21=new Set([".png",".jpg",".jpeg",".gif",".bmp",".webp"]),I21=2000,G21=2000,Nf1=3932160,hE3=G1.strictObject({file_path:G1.string().describe("The absolute path to the file to read"),offset:G1.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:G1.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),FZ={name:"View",async description(){return mM2}

{file_path:G1.string().describe("The absolute path to the file to read"),offset:G1.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:G1.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),FZ={name:"View",async description(){return mM2}
```

### Version 0.2.49

```typescript
{return I.length/4}var Fv1=3,L91=262144,Kv1=20000,P91=new Set([".png",".jpg",".jpeg",".gif",".bmp",".webp"]),v91=2000,S91=2000,Jv1=3932160,xb5=Z1.strictObject({file_path:Z1.string().describe("The absolute path to the file to read"),offset:Z1.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:Z1.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),vB={name:"View",async description(){return xj2}

{file_path:Z1.string().describe("The absolute path to the file to read"),offset:Z1.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:Z1.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),vB={name:"View",async description(){return xj2}
```

### Version 0.2.9

```typescript
{VH.name} instead.`;var GJ1=3,wJ1=262144,ZJ1=new Set([".png",".jpg",".jpeg",".gif",".bmp",".webp"]),Ss=2000,Ls=2000,CJ1=3932160,qZ9=s.strictObject({file_path:s.string().describe("The absolute path to the file to read"),offset:s.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:s.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),Fd={name:"View",async description(){return Vg2}

{file_path:s.string().describe("The absolute path to the file to read"),offset:s.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:s.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),Fd={name:"View",async description(){return Vg2}
```


## MCP Implementation

### Version 0.2.45

No structured code could be extracted.

#### Raw Snippets

##### Snippet 1

```javascript
{B?" (Debug Mode)":""}`,Gj,Gj,...Z.map((Y)=>{let C;if(Y.type==="connected")C=q0.bold(q0.ansi256(W.success)("connected"));else if(Y.type==="pending")C=q0.bold(q0.ansi256(W.warning)("connecting…"));else C=q0.bold(q0.ansi256(W.error)("failed"));return`• ${Y.name}: ${C}`}).join(Gj),...w?[Gj,Gj,B?q0.dim(`Error logs will be shown inline. Log files are also saved in: ${PV.baseLogs()}`):q0.dim(`Run claude with --mcp-debug to see error logs inline, or view log files in: ${PV.baseLogs()}`)]:[]].join("")},userFacingName(){return"mcp"}},Sj2=RO3;var fO3=F1(L1(),1);var Pj2={type:"prompt",name:"pr-comments",description:"Get comments from a GitHub pull request",progressMessage:"fetching PR comments",isEnabled:!0,isHidden:!1,userFacingName(){return"pr-comments"},async getPromptForCommand(I){return[{role:"user",content:[{type:"text",text:`You are an AI assistant integrated into a git-based version control system. Your task is to fetch and display comments from a GitHub pull request.

Follow these steps:
```

### Version 0.2.49

No structured code could be extracted.

#### Raw Snippets

##### Snippet 1

```javascript
{B?" (Debug Mode)":""}`,Ij,Ij,...G.map((Y)=>{let X;if(Y.type==="connected")X=d0.bold(d0.ansi256(W.success)("connected"));else if(Y.type==="pending")X=d0.bold(d0.ansi256(W.warning)("connecting…"));else X=d0.bold(d0.ansi256(W.error)("failed"));return`• ${Y.name}: ${X}`}).join(Ij),...w?[Ij,Ij,B?d0.dim(`Error logs will be shown inline. Log files are also saved in: ${yV.baseLogs()}`):d0.dim(`Run claude with --mcp-debug to see error logs inline, or view log files in: ${yV.baseLogs()}`)]:[]].join("")},userFacingName(){return"mcp"}},Mm2=sS5;var oS5=H1(P1(),1);var vm2={type:"prompt",name:"pr-comments",description:"Get comments from a GitHub pull request",progressMessage:"fetching PR comments",isEnabled:!0,isHidden:!1,userFacingName(){return"pr-comments"},async getPromptForCommand(I){return[{role:"user",content:[{type:"text",text:`You are an AI assistant integrated into a git-based version control system. Your task is to fetch and display comments from a GitHub pull request.

Follow these steps:
```


## PermissionSystem Implementation

### Version 0.2.18

No structured code could be extracted.

#### Raw Snippets

##### Snippet 1

```javascript
ute path to the Jupyter notebook file to read (must be absolute, not relative)")});function Rg2(I){return I.flatMap(Vd9).reduce((G,Z)=>{if(G.length===0)return[Z];let W=G[G.length-1];if(W&&W.type==="text"&&Z.type==="text")return W.text+=`
`+Z.text,G;return[...G,Z]},[])}var CK={name:"ReadNotebook",async description(){return Ng2},async prompt(){return zg2},userFacingName(){return"Read Notebook"},async isEnabled(){return!0},inputSchema:Zd9,isReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!OC(CK.getPath(I))},async validateInput({notebook_path:I}){let d=qg2(I)?I:fg2(E0(),I);if(!tI9(d)){let G=Uq(d),Z="File does not exist.";if(G)Z+=` Did you mean ${G}?`;return{result:!1,message:Z}}if(dd9(d)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:d}){return`notebook_path: ${d?I.notebook_path:Gd9(E0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return _X.createElement(A3,n
```

##### Snippet 2

```javascript
 path to the file to read"),offset:s.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:s.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),DG={name:"View",async description(){return Ug2},async prompt(){return Eg2},inputSchema:Vw9,userFacingName(){return"Read"},async isEnabled(){return!0},isReadOnly(){return!0},getPath({file_path:I}){return I||E0()},needsPermissions(I){return!OC(DG.getPath(I))},renderToolUseMessage(I,{verbose:d}){let{file_path:G,...Z}=I;return[["file_path",d?G:Aw9(E0(),G)],...Object.entries(Z)].map(([w,B])=>`${w}: ${JSON.stringify(B)}`).join(", ")},renderToolResultMessage(I,{verbose:d}){switch(I.type){case"image":return S3.createElement(c,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},S3.createElement(c,{flexDirection:"row"},S3.createElement(T,null,"  ⎿  "),S3.createElement(T,null,"Read image")));case"text
```

##### Snippet 3

```javascript
ore than ${Au} files in the repository. Use the LS tool (passing a specific path), Bash tool, and other tools to explore nested directories. The first ${Au} files and directories are included below:

`,Dw9=s.strictObject({path:s.string().describe("The absolute path to the directory to list (must be absolute, not relative)")}),HG={name:"LS",async description(){return pg1},userFacingName(){return"List"},async isEnabled(){return!0},inputSchema:Dw9,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!OC(HG.getPath(I))},async prompt(){return pg1},renderResultForAssistant(I){return I},renderToolUseMessage({path:I},{verbose:d}){let G=I?rN2(I)?I:oN2(E0(),I):void 0,Z=G?ag1(E0(),G):".";return`path: "${d?I:Z}"`},renderToolUseRejectedMessage(){return zI.createElement(A3,null)},renderToolResultMessage(I,{verbose:d}){if(typeof I!=="string")return null;let G=I.replace(ng1,"");if(!G)return null;return zI.createElement(c,{justifyContent:"space-between",width:"100%"},zI.createEl
```

##### Snippet 4

```javascript
put: Shows working tree status

          Input: npm install
          Output: Installs package dependencies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`});return(d.message.content[0]?.type==="text"?d.message.content[0].text:null)||"Executes a bash command"}catch(d){return C0(d),"Executes a bash command"}},async prompt(){return Iz2},isReadOnly(){return!1},inputSchema:Yu,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let d=PR(I);for(let G of d){let Z=G.split(" "),W=Z[0];if(W&&rg1.includes(W.toLowerCase()))return{result:!1,message:`Command '${W}' is not allowed for security reasons`};if(W==="cd"&&Z[1]){let w=Z[1].replace(/^['"]|['"]$/g,""),B=dz2(w)?w:Zz2(E0(),w);if(!hx(Gz2(II(),B),Gz2(E0(),II())))return{result:!1,message:`ERROR: cd to '${B}' was blocked. For security, ${K4} may only change directories to child directories of the original working di
```

##### Snippet 5

```javascript
},B=await fetch(this._endpoint,w);if(!B.ok){let C=await B.text().catch(()=>null);throw new Error(`Error POSTing to endpoint (HTTP ${B.status}): ${C}`)}}catch(W){throw(Z=this.onerror)===null||Z===void 0||Z.call(this,W),W}}}var i9=F1($1(),1);var gq2="",Kq2="";var IA9=s.object({}).passthrough(),Nq2={async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return Kq2},async prompt(){return gq2},inputSchema:IA9,async*call(){yield{type:"result",data:"",resultForAssistant:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([d,G])=>`${d}: ${JSON.stringify(G)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return i9.createElement(A3,null)},renderToolResultMessage(I,{verbose:d}){if(Array.isArray(I))return i9.createElement(c,{flexDirection:"column"},I.map((Z,W)=>{if(Z.type==="image")return i9.createElement(c,{key:W,justifyContent:"space-between",overflowX:"hidden",width:"100%"},i9.createElement(c,{flexDirection:"r
```

##### Snippet 6

```javascript
_path:s.string().describe("The absolute path to the file to write (must be absolute, not relative)"),content:s.string().describe("The content to write to the file")}),U8={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return Tq2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:d}){return`file_path: ${d?I.file_path:XN1(E0(),I.file_path)}`},inputSchema:SA9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!sR(U8.getPath(I))},renderToolUseRejectedMessage({file_path:I,content:d},{columns:G,verbose:Z}){try{let W=VN1(I)?I:YN1(E0(),I),w=AN1(W),B=w?Id(W):"utf-8",C=w?pq2(W,B):null,A=C?"update":"create",V=qX({filePath:I,fileContents:C??"",oldStr:C??"",newStr:d});return Y5.createElement(c,{flexDirection:"column"},Y5.createElement(T,null,"  ","⎿"," ",Y5.createElement(T,{color:n1().error},"User rejected ",A==="update"?"update":"write"," to"," "),Y5.createElement(T,{bold:!0},Z?I:XN1
```

##### Snippet 7

```javascript
scribe("The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required."),edit_mode:s.string().optional().describe("The type of edit to make (replace, insert, delete). Defaults to replace.")}),gd={name:"NotebookEditCell",async description(){return tq2},async prompt(){return If2},userFacingName(){return"Edit Notebook"},async isEnabled(){return!0},inputSchema:TA9,isReadOnly(){return!1},getPath(I){return I.notebook_path},needsPermissions(I){return!sR(gd.getPath(I))},renderResultForAssistant({cell_number:I,edit_mode:d,new_source:G,error:Z}){if(Z)return Z;switch(d){case"replace":return`Updated cell ${I} with ${G}`;case"insert":return`Inserted cell ${I} with ${G}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:d}){return`notebook_path: ${d?I.notebook_path:uA9(E0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I.edi
```

##### Snippet 8

```javascript
ath:s.string().describe("The absolute path to the file to modify"),old_string:s.string().describe("The text to replace"),new_string:s.string().describe("The text to replace it with")}),Vf2=4;var p7={name:"Edit",async description(){return"A tool for editing files"},async prompt(){return Wf2},userFacingName({old_string:I,new_string:d}){if(I==="")return"Create";if(d==="")return"Delete";return"Update"},async isEnabled(){return!0},inputSchema:hA9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!sR(I.file_path)},renderToolUseMessage(I,{verbose:d}){return`file_path: ${d?I.file_path:Cf2(E0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:d},{verbose:G}){return y3.createElement(co,{filePath:I,structuredPatch:d,verbose:G})},renderToolUseRejectedMessage({file_path:I,old_string:d,new_string:G},{columns:Z,verbose:W}){try{let{patch:w}=DN1(I,d,G);return y3.createElement(c,{flexDirection:"column"},y3.createElement(T,null,"  ","⎿"," ",y3.createElemen
```

##### Snippet 9

```javascript
mColor:!0},"Cost: $",I.toFixed(4)," (",Z,"s)"))}import{isAbsolute as ZV9,relative as WV9,resolve as wV9}from"path";var BV9=s.strictObject({pattern:s.string().describe("The glob pattern to match files against"),path:s.string().optional().describe("The directory to search in. Defaults to the current working directory.")}),i7={name:Io,async description(){return xg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:BV9,isReadOnly(){return!0},getPath({path:I}){return I||E0()},needsPermissions(I){return!OC(i7.getPath(I))},async prompt(){return xg1},renderToolUseMessage({pattern:I,path:d},{verbose:G}){let Z=d?ZV9(d)?d:wV9(E0(),d):void 0,W=Z?WV9(E0(),Z):void 0;return`pattern: "${I}"${W||G?`, path: "${G?Z:W}"`:""}`},renderToolUseRejectedMessage(){return vH.default.createElement(A3,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return vH.default.createElement(c,{justifyContent:"space-between",width:"100%"},vH.default.createElement(c,{flexDirectio
```

##### Snippet 10

```javascript
{pattern:s.string().describe("The regular expression pattern to search for in file contents"),path:s.string().optional().describe("The directory to search in. Defaults to the current working directory."),include:s.string().optional().describe('File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")')}),Nf2=100,Sw={name:Go,async description(){return cg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:AV9,isReadOnly(){return!0},getPath({path:I}){return I||E0()},needsPermissions({path:I}){return!OC(I||E0())},async prompt(){return cg1},renderToolUseMessage({pattern:I,path:d,include:G},{verbose:Z}){let{absolutePath:W,relativePath:w}=a50(d);return`pattern: "${I}"${w||Z?`, path: "${Z?W:w}"`:""}${G?`, include: "${G}"`:""}`},renderToolUseRejectedMessage(){return MH.default.createElement(A3,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return MH.default.createElement(c,{justifyContent:"space-between",width:"100%"},MH.default.createElement(c,{fle
```

##### Snippet 11

```javascript
1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`};if(w.every((C)=>{let A=B.subcommandPrefixes.get(C);if(A===void 0||A.commandInjectionDetected)return!1;return dR2(I,C,A?A.commandPrefix:null,Z)}))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}},$H=async(I,d,G,Z)=>{if(G.options.dangerouslySkipPermissions)return{result:!0};if(G.abortController.signal.aborted)throw new bz;try{if(!I.needsPermissions(d))return{result:!0}}catch(B){return C0(`Error checking permissions: ${B}`),{result:!1,message:"Error checking permissions"}}let w=y4().allowedTools??[];if(I===G5&&w.includes(G5.name))return{result:!0};switch(I){case G5:{let{command:B}=Yu.parse(d);return await eV9(I,B,G,w)}case p7:case U8:case gd:{if(!I.needsPermissions(d))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}default:{let B=ZT(I,d,null);if(w.
```

##### Snippet 12

```javascript
ame}, but you haven't granted it yet.`}},$H=async(I,d,G,Z)=>{if(G.options.dangerouslySkipPermissions)return{result:!0};if(G.abortController.signal.aborted)throw new bz;try{if(!I.needsPermissions(d))return{result:!0}}catch(B){return C0(`Error checking permissions: ${B}`),{result:!1,message:"Error checking permissions"}}let w=y4().allowedTools??[];if(I===G5&&w.includes(G5.name))return{result:!0};switch(I){case G5:{let{command:B}=Yu.parse(d);return await eV9(I,B,G,w)}case p7:case U8:case gd:{if(!I.needsPermissions(d))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}default:{let B=ZT(I,d,null);if(w.includes(B))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}}};async function RX(I,d,G){let Z=ZT(I,d,G);if(I===p7||I===U8||I===gd){$s();return}let W=y4();if(W.allowedTools.includes(Z))return;W.allowedTools.push(Z),W.allowedTools.sort(),o9(W)}fun
```

##### Snippet 13

```javascript
cache_creation_input_tokens??0)+(E.message.usage.cache_read_input_tokens??0)+E.message.usage.input_tokens+E.message.usage.output_tokens)+" tokens",RP(Date.now()-C)];yield{type:"progress",content:R8(`Done (${L.join(" · ")})`),normalizedMessages:Q,tools:V}}let S=E.message.content.filter((L)=>L.type==="text");yield{type:"result",data:S,normalizedMessages:Q,resultForAssistant:this.renderResultForAssistant(S),tools:V}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:d}){let G=I.split(EY9);return RU(!d&&G.length>1?G[0]+"…":I)},renderToolUseRejectedMessage(){return oN1.createElement(A3,null)}};var RK=F1($1(),1);var eR2=`You are an expert software architect. Your role is to analyze technical requirements and produce clear, actionable implementation plans.
These plans will then be carried out by a junior software engineer so you need to be specific and de
```

##### Snippet 14

```javascript
 whenever you need help planning how to implement a feature, solve a technical problem, or structure your code.";var MY9=[G5,HG,DG,U8,i7,Sw],SY9=s.strictObject({prompt:s.string().describe("The technical request or coding task to analyze"),context:s.string().describe("Optional context from previous conversation or system state").optional()}),tR2={name:"Architect",async description(){return eN1},inputSchema:SY9,isReadOnly(){return!0},userFacingName(){return"Architect"},async isEnabled(){return!1},needsPermissions(){return!1},async*call({prompt:I,context:d},G,Z){let W=d?`<context>${d}</context>

${I}`:I,B=[v9(W)],C=(G.options.tools??[]).filter((X)=>MY9.map((_)=>_.name).includes(X.name)),A=await gX(cC(B,[eR2],await k7(),Z,{...G,options:{...G.options,tools:C}}));if(A.type!=="assistant")throw new Error("Invalid response from Claude API");let V=A.message.content.filter((X)=>X.type==="text");yield{type:"result",data:V,resultForAssistant:this.renderResultForAssistant(V)}},async prompt(){return 
```

##### Snippet 15

```javascript
sReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!OC(CK.getPath(I))},async validateInput({notebook_path:I}){let d=qg2(I)?I:fg2(E0(),I);if(!tI9(d)){let G=Uq(d),Z="File does not exist.";if(G)Z+=` Did you mean ${G}?`;return{result:!1,message:Z}}if(dd9(d)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:d}){return`notebook_path: ${d?I.notebook_path:Gd9(E0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return _X.createElement(A3,null)},renderToolResultMessage(I){if(!I)return _X.createElement(T,null,"No cells found in notebook");if(I.length<1||!I[0])return _X.createElement(T,null,"No cells found in notebook");return _X.createElement(T,null,"Read ",I.length," cells")},async*call({notebook_path:I}){let d=qg2(I)?I:fg2(E0(),I),G=Id9(d,"utf-8"),Z=JSON.parse(G),W=Z.metadata.language_info?.name??"python",w=Z.cells.map((B,C)=>Bd9(B,C,W));yield{type:"result",resultForAssis
```

##### Snippet 16

```javascript
e")));case"text":{let{filePath:G,content:Z,numLines:W}=I.file,w=Z||"(No content)";return S3.createElement(c,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},S3.createElement(c,{flexDirection:"row"},S3.createElement(T,null,"  ⎿  "),S3.createElement(c,{flexDirection:"column"},S3.createElement(TC,{code:d?w:w.split(`
`).slice(0,lg1).filter((B)=>B.trim()!=="").join(`
`),language:Cw9(G).slice(1)}),!d&&W>lg1&&S3.createElement(T,{color:n1().secondaryText},"... (+",W-lg1," lines)"))))}}},renderToolUseRejectedMessage(){return S3.createElement(A3,null)},async validateInput({file_path:I,offset:d,limit:G}){let Z=E71(I);if(v_(Z))return{result:!1,message:"File is in a directory that is ignored by your project configuration."};if(!Bw9(Z)){let C=Uq(Z),A="File does not exist.";if(C)A+=` Did you mean ${C}?`;return{result:!1,message:A}}let w=aN2(Z).size,B=kg1.extname(Z).toLowerCase();if(!bg1.has(B)){if(w>hg1&&!d&&!G)return{result:!1,message:nN2(w),meta:{fileSize:w}}}return{result:!0}},asyn
```

##### Snippet 17

```javascript
).describe("The absolute path to the directory to list (must be absolute, not relative)")}),HG={name:"LS",async description(){return pg1},userFacingName(){return"List"},async isEnabled(){return!0},inputSchema:Dw9,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!OC(HG.getPath(I))},async prompt(){return pg1},renderResultForAssistant(I){return I},renderToolUseMessage({path:I},{verbose:d}){let G=I?rN2(I)?I:oN2(E0(),I):void 0,Z=G?ag1(E0(),G):".";return`path: "${d?I:Z}"`},renderToolUseRejectedMessage(){return zI.createElement(A3,null)},renderToolResultMessage(I,{verbose:d}){if(typeof I!=="string")return null;let G=I.replace(ng1,"");if(!G)return null;return zI.createElement(c,{justifyContent:"space-between",width:"100%"},zI.createElement(c,null,zI.createElement(T,null,"  ⎿  "),zI.createElement(c,{flexDirection:"column",paddingLeft:0},G.split(`
`).filter((Z)=>Z.trim()!=="").slice(0,d?void 0:ig1).map((Z,W)=>zI.createElement(T,{key:W},Z)),!d&&G.split(`
`).length>ig1&
```

##### Snippet 18

```javascript
(E0(),w);if(!hx(Gz2(II(),B),Gz2(E0(),II())))return{result:!1,message:`ERROR: cd to '${B}' was blocked. For security, ${K4} may only change directories to child directories of the original working directory (${II()}) for this session.`}}}return{result:!0}},renderToolUseMessage({command:I}){if(I.includes(`"$(cat <<'EOF'`)){let d=I.match(/^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/);if(d&&d[1]&&d[2]){let G=d[1],Z=d[2],W=d[3]||"";return`${G.trim()} "${Z.trim()}"${W.trim()}`}}return I},renderToolUseRejectedMessage(){return Xu.createElement(A3,null)},renderToolResultMessage(I,{verbose:d}){return Xu.createElement(Zo,{content:I,verbose:d})},renderResultForAssistant({interrupted:I,stdout:d,stderr:G,isImage:Z}){if(Z){let B=d.trim().match(/^data:([^;]+);base64,(.+)$/);if(B){let C=B[1],A=B[2];return[{type:"image",source:{type:"base64",media_type:C||"image/jpeg",data:A||""}}]}return d.trim()}let W=G.trim();if(I){if(G)W+=Wo;W+="<error>Command was aborted before completion</error>"}let 
```

##### Snippet 19

```javascript
W){throw(Z=this.onerror)===null||Z===void 0||Z.call(this,W),W}}}var i9=F1($1(),1);var gq2="",Kq2="";var IA9=s.object({}).passthrough(),Nq2={async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return Kq2},async prompt(){return gq2},inputSchema:IA9,async*call(){yield{type:"result",data:"",resultForAssistant:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([d,G])=>`${d}: ${JSON.stringify(G)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return i9.createElement(A3,null)},renderToolResultMessage(I,{verbose:d}){if(Array.isArray(I))return i9.createElement(c,{flexDirection:"column"},I.map((Z,W)=>{if(Z.type==="image")return i9.createElement(c,{key:W,justifyContent:"space-between",overflowX:"hidden",width:"100%"},i9.createElement(c,{flexDirection:"row"},i9.createElement(T,null,"  ⎿  "),i9.createElement(T,null,"[Image]")));let w=Z.text.split(`
`).length;return i9.createElement(wU,{key:W,content:Z.text,lin
```

##### Snippet 20

```javascript
o the file to write (must be absolute, not relative)"),content:s.string().describe("The content to write to the file")}),U8={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return Tq2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:d}){return`file_path: ${d?I.file_path:XN1(E0(),I.file_path)}`},inputSchema:SA9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!sR(U8.getPath(I))},renderToolUseRejectedMessage({file_path:I,content:d},{columns:G,verbose:Z}){try{let W=VN1(I)?I:YN1(E0(),I),w=AN1(W),B=w?Id(W):"utf-8",C=w?pq2(W,B):null,A=C?"update":"create",V=qX({filePath:I,fileContents:C??"",oldStr:C??"",newStr:d});return Y5.createElement(c,{flexDirection:"column"},Y5.createElement(T,null,"  ","⎿"," ",Y5.createElement(T,{color:n1().error},"User rejected ",A==="update"?"update":"write"," to"," "),Y5.createElement(T,{bold:!0},Z?I:XN1(E0(),I))),xC(V.map((X)=>Y5.createElement(c,{f
```

##### Snippet 21

```javascript
eturn!sR(gd.getPath(I))},renderResultForAssistant({cell_number:I,edit_mode:d,new_source:G,error:Z}){if(Z)return Z;switch(d){case"replace":return`Updated cell ${I} with ${G}`;case"insert":return`Inserted cell ${I} with ${G}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:d}){return`notebook_path: ${d?I.notebook_path:uA9(E0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I.edit_mode??"replace"}`},renderToolUseRejectedMessage(){return qI.createElement(A3,null)},renderToolResultMessage({cell_number:I,new_source:d,language:G,error:Z}){if(Z)return qI.createElement(c,{flexDirection:"column"},qI.createElement(T,{color:"red"},Z));return qI.createElement(c,{flexDirection:"column"},qI.createElement(T,null,"Updated cell ",I,":"),qI.createElement(c,{marginLeft:2},qI.createElement(TC,{code:d,language:G})))},async validateInput({notebook_path:I,cell_number:d,cell_type:G,edit_mode:Z="replace"}){let W=
```

##### Snippet 22

```javascript
(){return Wf2},userFacingName({old_string:I,new_string:d}){if(I==="")return"Create";if(d==="")return"Delete";return"Update"},async isEnabled(){return!0},inputSchema:hA9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!sR(I.file_path)},renderToolUseMessage(I,{verbose:d}){return`file_path: ${d?I.file_path:Cf2(E0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:d},{verbose:G}){return y3.createElement(co,{filePath:I,structuredPatch:d,verbose:G})},renderToolUseRejectedMessage({file_path:I,old_string:d,new_string:G},{columns:Z,verbose:W}){try{let{patch:w}=DN1(I,d,G);return y3.createElement(c,{flexDirection:"column"},y3.createElement(T,null,"  ","⎿"," ",y3.createElement(T,{color:n1().error},"User rejected ",d===""?"write":"update"," to"," "),y3.createElement(T,{bold:!0},W?I:Cf2(E0(),I))),xC(w.map((B)=>y3.createElement(c,{flexDirection:"column",paddingLeft:5,key:B.newStart},y3.createElement(aZ,{patch:B,dim:!0,width:Z-12}))),(B)=>y3.createEle
```

##### Snippet 23

```javascript
ribe("The directory to search in. Defaults to the current working directory.")}),i7={name:Io,async description(){return xg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:BV9,isReadOnly(){return!0},getPath({path:I}){return I||E0()},needsPermissions(I){return!OC(i7.getPath(I))},async prompt(){return xg1},renderToolUseMessage({pattern:I,path:d},{verbose:G}){let Z=d?ZV9(d)?d:wV9(E0(),d):void 0,W=Z?WV9(E0(),Z):void 0;return`pattern: "${I}"${W||G?`, path: "${G?Z:W}"`:""}`},renderToolUseRejectedMessage(){return vH.default.createElement(A3,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return vH.default.createElement(c,{justifyContent:"space-between",width:"100%"},vH.default.createElement(c,{flexDirection:"row"},vH.default.createElement(T,null,"  ⎿  Found "),vH.default.createElement(T,{bold:!0},I.numFiles," "),vH.default.createElement(T,null,I.numFiles===0||I.numFiles>1?"files":"file")),vH.default.createElement(EH,{costUSD:0,durationMs:I.du
```

##### Snippet 24

```javascript
clude in the search (e.g. "*.js", "*.{ts,tsx}")')}),Nf2=100,Sw={name:Go,async description(){return cg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:AV9,isReadOnly(){return!0},getPath({path:I}){return I||E0()},needsPermissions({path:I}){return!OC(I||E0())},async prompt(){return cg1},renderToolUseMessage({pattern:I,path:d,include:G},{verbose:Z}){let{absolutePath:W,relativePath:w}=a50(d);return`pattern: "${I}"${w||Z?`, path: "${Z?W:w}"`:""}${G?`, include: "${G}"`:""}`},renderToolUseRejectedMessage(){return MH.default.createElement(A3,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return MH.default.createElement(c,{justifyContent:"space-between",width:"100%"},MH.default.createElement(c,{flexDirection:"row"},MH.default.createElement(T,null,"  ⎿  Found "),MH.default.createElement(T,{bold:!0},I.numFiles," "),MH.default.createElement(T,null,I.numFiles===0||I.numFiles>1?"files":"file")),MH.default.createElement(EH,{costUSD:0,durationMs:I.durationMs,deb
```

##### Snippet 25

```javascript
return G}function to(I,d,G){return zf2.useMemo(()=>{let Z=VV9(I,G);if(!Z)throw new ReferenceError(`Tool use not found for tool_use_id ${I}`);let W=[...d,i7,Sw].find((w)=>w.name===Z.name);if(W===i7||W===Sw)t1("tengu_legacy_tool_lookup",{});if(!W)throw new ReferenceError(`Tool not found for ${Z.name}`);return{tool:W,toolUse:Z}},[I,G,d])}function Qf2({toolUseID:I,tools:d,messages:G,verbose:Z}){let{columns:W}=d9(),{tool:w,toolUse:B}=to(I,d,G),C=w.inputSchema.safeParse(B.input);if(C.success)return w.renderToolUseRejectedMessage(C.data,{columns:W,verbose:Z});return KN1.createElement(A3,null)}var NN1=F1($1(),1);function qf2({param:I,message:d,messages:G,tools:Z,verbose:W,width:w}){let{tool:B}=to(I.tool_use_id,Z,G);return NN1.createElement(c,{flexDirection:"column",width:w},B.renderToolResultMessage?.(d.toolUseResult.data,{verbose:W}))}function ff2({param:I,message:d,messages:G,tools:Z,verbose:W,width:w}){if(I.content===qU)return fX.createElement(gf2,null);if(I.content===xu)return fX.createEle
```

##### Snippet 26

```javascript
gName:()=>"Think",description:async()=>Uf2,inputSchema:XV9,isEnabled:async()=>Boolean(process.env.THINK_TOOL)&&await RY("tengu_think_tool"),isReadOnly:()=>!0,needsPermissions:()=>!1,prompt:async()=>Ef2,async*call(I,{messageId:d}){t1("tengu_thinking",{messageId:d,thoughtLength:I.thought.length.toString(),method:"tool",provider:P9?"bedrock":u9?"vertex":"1p"}),yield{type:"result",resultForAssistant:"Your thought has been logged.",data:{thought:I.thought}}},renderToolUseMessage(I){return I.thought},renderToolUseRejectedMessage(){return zN1.default.createElement(hu,null,zN1.default.createElement(T,{color:n1().error},"Thought cancelled"))},renderResultForAssistant:()=>"Your thought has been logged."};var dT=F1($1(),1);function qN1(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var qK=qN1();function $f2(I){qK=I}var ru={exec:()=>null};function Z9(I,d=""){let G=typeof I==="string"?I:I.source,Z={replace:(W,w)=>{le
```

##### Snippet 27

```javascript
d{type:"progress",content:R8(`Done (${L.join(" · ")})`),normalizedMessages:Q,tools:V}}let S=E.message.content.filter((L)=>L.type==="text");yield{type:"result",data:S,normalizedMessages:Q,resultForAssistant:this.renderResultForAssistant(S),tools:V}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:d}){let G=I.split(EY9);return RU(!d&&G.length>1?G[0]+"…":I)},renderToolUseRejectedMessage(){return oN1.createElement(A3,null)}};var RK=F1($1(),1);var eR2=`You are an expert software architect. Your role is to analyze technical requirements and produce clear, actionable implementation plans.
These plans will then be carried out by a junior software engineer so you need to be specific and detailed. However do not actually write the code, just explain the plan.

Follow these steps for each request:
1. Carefully analyze requirements to identify core functiona
```

##### Snippet 28

```javascript
nvalid response from Claude API");let V=A.message.content.filter((X)=>X.type==="text");yield{type:"result",data:V,resultForAssistant:this.renderResultForAssistant(V)}},async prompt(){return eN1},renderResultForAssistant(I){return I},renderToolUseMessage(I){return Object.entries(I).map(([d,G])=>`${d}: ${JSON.stringify(G)}`).join(", ")},renderToolResultMessage(I){return RK.createElement(c,{flexDirection:"column",gap:1},RK.createElement(TC,{code:I.map((d)=>d.text).join(`
`),language:"markdown"}))},renderToolUseRejectedMessage(){return RK.createElement(A3,null)}};var LY9=F1($1(),1);var Rk3=s.strictObject({file_path:s.string().optional().describe("Optional path to a specific memory file to read")});var yY9=F1($1(),1);var uk3=s.strictObject({file_path:s.string().describe("Path to the memory file to write"),content:s.string().describe("Content to write to the file")});var fe=F1($1(),1);var IU2="Sends the user swag stickers with love from Anthropic.",dU2=`This tool should be used whenever a us
```

##### Snippet 29

```javascript
s_optional_address:Boolean(w.address2).toString()}),G(!0),d.setToolJSX?.(null)},onClose:()=>{t1("sticker_request_form_cancelled",{}),G(!1),d.setToolJSX?.(null)}}),shouldHidePromptInput:!0});let W=await Z;if(!W)throw d.abortController.abort(),new Error("Sticker request cancelled");yield{type:"result",resultForAssistant:"Sticker request completed! Please tell the user that they will receive stickers in the mail if they have submitted the form!",data:{success:W}}},renderToolUseMessage(I){return""},renderToolUseRejectedMessage:(I)=>fe.default.createElement(T,null,"  ⎿  ",fe.default.createElement(T,{color:n1().error},"No (Sticker request cancelled)")),renderResultForAssistant:(I)=>I};var CU2=()=>{return[EU,G5,i7,Sw,HG,DG,p7,U8,CK,gd,BU2,zK,...[]]},Qe=a2(async(I)=>{let d=[...CU2(),...await yq2()];if(I)d.push(tR2);let G=await Promise.all(d.map((Z)=>Z.isEnabled()));return d.filter((Z,W)=>G[W])}),oR2=a2(async()=>{let I=CU2().filter((G)=>G.isReadOnly()),d=await Promise.all(I.map((G)=>G.isEnabled
```

### Version 0.2.25

No structured code could be extracted.

#### Raw Snippets

##### Snippet 1

```javascript
ute path to the Jupyter notebook file to read (must be absolute, not relative)")});function Zg2(I){return I.flatMap(BZ9).reduce((Z,d)=>{if(Z.length===0)return[d];let W=Z[Z.length-1];if(W&&W.type==="text"&&d.type==="text")return W.text+=`
`+d.text,Z;return[...Z,d]},[])}var gg={name:"ReadNotebook",async description(){return oK2},async prompt(){return eK2},userFacingName(){return"Read Notebook"},async isEnabled(){return!0},inputSchema:tG9,isReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!lC(gg.getPath(I))},async validateInput({notebook_path:I}){let G=Ig2(I)?I:Gg2(E0(),I);if(!rG9(G)){let Z=mq(G),d="File does not exist.";if(Z)d+=` Did you mean ${Z}?`;return{result:!1,message:d}}if(oG9(G)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:eG9(E0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return gX.createElement(X3,n
```

##### Snippet 2

```javascript
 path to the file to read"),offset:s.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:s.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),FZ={name:"View",async description(){return dg2},async prompt(){return Wg2},inputSchema:Bw9,userFacingName(){return"Read"},async isEnabled(){return!0},isReadOnly(){return!0},getPath({file_path:I}){return I||E0()},needsPermissions(I){return!lC(FZ.getPath(I))},renderToolUseMessage(I,{verbose:G}){let{file_path:Z,...d}=I;return[["file_path",G?Z:Ww9(E0(),Z)],...Object.entries(d)].map(([B,w])=>`${B}: ${JSON.stringify(w)}`).join(", ")},renderToolResultMessage(I,{verbose:G}){switch(I.type){case"image":return P3.createElement(x,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},P3.createElement(x,{flexDirection:"row"},P3.createElement(T,null,"  ⎿  "),P3.createElement(T,null,"Read image")));case"text
```

##### Snippet 3

```javascript
ore than ${zO} files in the repository. Use the LS tool (passing a specific path), Bash tool, and other tools to explore nested directories. The first ${zO} files and directories are included below:

`,Aw9=s.strictObject({path:s.string().describe("The absolute path to the directory to list (must be absolute, not relative)")}),JZ={name:"LS",async description(){return Vg1},userFacingName(){return"List"},async isEnabled(){return!0},inputSchema:Aw9,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!lC(JZ.getPath(I))},async prompt(){return Vg1},renderResultForAssistant(I){return I},renderToolUseMessage({path:I},{verbose:G}){let Z=I?vz2(I)?I:Sz2(E0(),I):void 0,d=Z?Yg1(E0(),Z):".";return`path: "${G?I:d}"`},renderToolUseRejectedMessage(){return RI.createElement(X3,null)},renderToolResultMessage(I,{verbose:G}){if(typeof I!=="string")return null;let Z=I.replace(Xg1,"");if(!Z)return null;return RI.createElement(x,{justifyContent:"space-between",width:"100%"},RI.createEl
```

##### Snippet 4

```javascript
put: Shows working tree status

          Input: npm install
          Output: Installs package dependencies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`});return(G.message.content[0]?.type==="text"?G.message.content[0].text:null)||"Executes a bash command"}catch(G){return A0(G),"Executes a bash command"}},async prompt(){return yz2},isReadOnly(){return!1},inputSchema:RO,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let G=cU(I);for(let Z of G){let d=Z.split(" "),W=d[0];if(W&&_g1.includes(W.toLowerCase()))return{result:!1,message:`Command '${W}' is not allowed for security reasons`};if(W==="cd"&&d[1]){let B=d[1].replace(/^['"]|['"]$/g,""),w=Pz2(B)?B:Tz2(E0(),B);if(!ox(Oz2(dI(),w),Oz2(E0(),dI())))return{result:!1,message:`ERROR: cd to '${w}' was blocked. For security, ${X4} may only change directories to child directories of the original working di
```

##### Snippet 5

```javascript
},w=await fetch(this._endpoint,B);if(!w.ok){let C=await w.text().catch(()=>null);throw new Error(`Error POSTing to endpoint (HTTP ${w.status}): ${C}`)}}catch(W){throw(d=this.onerror)===null||d===void 0||d.call(this,W),W}}}var r9=Y1(M1(),1);var IR2="",GR2="";var qA9=s.object({}).passthrough(),ZR2={async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return GR2},async prompt(){return IR2},inputSchema:qA9,async*call(){yield{type:"result",data:"",resultForAssistant:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return r9.createElement(X3,null)},renderToolResultMessage(I,{verbose:G}){if(Array.isArray(I))return r9.createElement(x,{flexDirection:"column"},I.map((d,W)=>{if(d.type==="image")return r9.createElement(x,{key:W,justifyContent:"space-between",overflowX:"hidden",width:"100%"},r9.createElement(x,{flexDirection:"r
```

##### Snippet 6

```javascript
_path:s.string().describe("The absolute path to the file to write (must be absolute, not relative)"),content:s.string().describe("The content to write to the file")}),v8={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return NR2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:LN1(E0(),I.file_path)}`},inputSchema:jA9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!Cf(v8.getPath(I))},renderToolUseRejectedMessage({file_path:I,content:G},{columns:Z,verbose:d}){try{let W=SN1(I)?I:$N1(E0(),I),B=MN1(W),w=B?dG(W):"utf-8",C=B?zR2(W,w):null,V=C?"update":"create",A=MX({filePath:I,fileContents:C??"",oldStr:C??"",newStr:G});return _5.createElement(x,{flexDirection:"column"},_5.createElement(T,null,"  ","⎿"," ",_5.createElement(T,{color:c1().error},"User rejected ",V==="update"?"update":"write"," to"," "),_5.createElement(T,{bold:!0},d?I:LN1
```

##### Snippet 7

```javascript
scribe("The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required."),edit_mode:s.string().optional().describe("The type of edit to make (replace, insert, delete). Defaults to replace.")}),NG={name:"NotebookEditCell",async description(){return MR2},async prompt(){return SR2},userFacingName(){return"Edit Notebook"},async isEnabled(){return!0},inputSchema:nA9,isReadOnly(){return!1},getPath(I){return I.notebook_path},needsPermissions(I){return!Cf(NG.getPath(I))},renderResultForAssistant({cell_number:I,edit_mode:G,new_source:Z,error:d}){if(d)return d;switch(G){case"replace":return`Updated cell ${I} with ${Z}`;case"insert":return`Inserted cell ${I} with ${Z}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:iA9(E0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I.edi
```

##### Snippet 8

```javascript
ath:s.string().describe("The absolute path to the file to modify"),old_string:s.string().describe("The text to replace"),new_string:s.string().describe("The text to replace it with")}),bR2=4;var a7={name:"Edit",async description(){return"A tool for editing files"},async prompt(){return PR2},userFacingName({old_string:I,new_string:G}){if(I==="")return"Create";if(G==="")return"Delete";return"Update"},async isEnabled(){return!0},inputSchema:IX9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!Cf(I.file_path)},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:uR2(E0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:G},{verbose:Z}){return T3.createElement(Ze,{filePath:I,structuredPatch:G,verbose:Z})},renderToolUseRejectedMessage({file_path:I,old_string:G,new_string:Z},{columns:d,verbose:W}){try{let{patch:B}=ON1(I,G,Z);return T3.createElement(x,{flexDirection:"column"},T3.createElement(T,null,"  ","⎿"," ",T3.createElemen
```

##### Snippet 9

```javascript
mColor:!0},"Cost: $",I.toFixed(4)," (",d,"s)"))}import{isAbsolute as HX9,relative as FX9,resolve as JX9}from"path";var KX9=s.strictObject({pattern:s.string().describe("The glob pattern to match files against"),path:s.string().optional().describe("The directory to search in. Defaults to the current working directory.")}),r7={name:Ao,async description(){return wg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:KX9,isReadOnly(){return!0},getPath({path:I}){return I||E0()},needsPermissions(I){return!lC(r7.getPath(I))},async prompt(){return wg1},renderToolUseMessage({pattern:I,path:G},{verbose:Z}){let d=G?HX9(G)?G:JX9(E0(),G):void 0,W=d?FX9(E0(),d):void 0;return`pattern: "${I}"${W||Z?`, path: "${Z?d:W}"`:""}`},renderToolUseRejectedMessage(){return TH.default.createElement(X3,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return TH.default.createElement(x,{justifyContent:"space-between",width:"100%"},TH.default.createElement(x,{flexDirectio
```

##### Snippet 10

```javascript
{pattern:s.string().describe("The regular expression pattern to search for in file contents"),path:s.string().optional().describe("The directory to search in. Defaults to the current working directory."),include:s.string().optional().describe('File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")')}),aR2=100,yB={name:Xo,async description(){return Cg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:NX9,isReadOnly(){return!0},getPath({path:I}){return I||E0()},needsPermissions({path:I}){return!lC(I||E0())},async prompt(){return Cg1},renderToolUseMessage({pattern:I,path:G,include:Z},{verbose:d}){let{absolutePath:W,relativePath:B}=f90(G);return`pattern: "${I}"${B||d?`, path: "${d?W:B}"`:""}${Z?`, include: "${Z}"`:""}`},renderToolUseRejectedMessage(){return uH.default.createElement(X3,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return uH.default.createElement(x,{justifyContent:"space-between",width:"100%"},uH.default.createElement(x,{fle
```

##### Snippet 11

```javascript
1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`};if(B.every((C)=>{let V=w.subcommandPrefixes.get(C);if(V===void 0||V.commandInjectionDetected)return!1;return LU2(I,C,V?V.commandPrefix:null,d)}))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}},jH=async(I,G,Z,d)=>{if(Z.options.dangerouslySkipPermissions)return{result:!0};if(Z.abortController.signal.aborted)throw new oz;try{if(!I.needsPermissions(G))return{result:!0}}catch(w){return A0(`Error checking permissions: ${w}`),{result:!1,message:"Error checking permissions"}}let B=R4().allowedTools??[];if(I===d5&&B.includes(d5.name))return{result:!0};switch(I){case d5:{let{command:w}=RO.parse(G);return await AY9(I,w,Z,B)}case a7:case v8:case NG:{if(!I.needsPermissions(G))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}default:{let w=DT(I,G,null);if(B.
```

##### Snippet 12

```javascript
ame}, but you haven't granted it yet.`}},jH=async(I,G,Z,d)=>{if(Z.options.dangerouslySkipPermissions)return{result:!0};if(Z.abortController.signal.aborted)throw new oz;try{if(!I.needsPermissions(G))return{result:!0}}catch(w){return A0(`Error checking permissions: ${w}`),{result:!1,message:"Error checking permissions"}}let B=R4().allowedTools??[];if(I===d5&&B.includes(d5.name))return{result:!0};switch(I){case d5:{let{command:w}=RO.parse(G);return await AY9(I,w,Z,B)}case a7:case v8:case NG:{if(!I.needsPermissions(G))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}default:{let w=DT(I,G,null);if(B.includes(w))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}}};async function LX(I,G,Z){let d=DT(I,G,Z);if(I===a7||I===v8||I===NG){js();return}let W=R4();if(W.allowedTools.includes(d))return;W.allowedTools.push(d),W.allowedTools.sort(),O9(W)}fun
```

##### Snippet 13

```javascript
cache_creation_input_tokens??0)+(U.message.usage.cache_read_input_tokens??0)+U.message.usage.input_tokens+U.message.usage.output_tokens)+" tokens",uP(Date.now()-C)];yield{type:"progress",content:E8(`Done (${$.join(" · ")})`),normalizedMessages:z,tools:A}}let S=U.message.content.filter(($)=>$.type==="text");yield{type:"result",data:S,normalizedMessages:z,resultForAssistant:this.renderResultForAssistant(S),tools:A}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:G}){let Z=I.split(KD9);return Of(!G&&Z.length>1?Z[0]+"…":I)},renderToolUseRejectedMessage(){return Lz1.createElement(X3,null)}};var ug=Y1(M1(),1);var if2=`You are an expert software architect. Your role is to analyze technical requirements and produce clear, actionable implementation plans.
These plans will then be carried out by a junior software engineer so you need to be specific and de
```

##### Snippet 14

```javascript
 whenever you need help planning how to implement a feature, solve a technical problem, or structure your code.";var ND9=[d5,JZ,FZ,v8,r7,yB],zD9=s.strictObject({prompt:s.string().describe("The technical request or coding task to analyze"),context:s.string().describe("Optional context from previous conversation or system state").optional()}),nf2={name:"Architect",async description(){return $z1},inputSchema:zD9,isReadOnly(){return!0},userFacingName(){return"Architect"},async isEnabled(){return!1},needsPermissions(){return!1},async*call({prompt:I,context:G},Z,d){let W=G?`<context>${G}</context>

${I}`:I,w=[M9(W)],C=(Z.options.tools??[]).filter((X)=>ND9.map((Y)=>Y.name).includes(X.name)),V=await RX(nC(w,[if2],await c7(),d,{...Z,options:{...Z.options,tools:C}}));if(V.type!=="assistant")throw new Error("Invalid response from Claude API");let A=V.message.content.filter((X)=>X.type==="text");yield{type:"result",data:A,resultForAssistant:this.renderResultForAssistant(A)}},async prompt(){return 
```

##### Snippet 15

```javascript
sReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!lC(gg.getPath(I))},async validateInput({notebook_path:I}){let G=Ig2(I)?I:Gg2(E0(),I);if(!rG9(G)){let Z=mq(G),d="File does not exist.";if(Z)d+=` Did you mean ${Z}?`;return{result:!1,message:d}}if(oG9(G)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:eG9(E0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return gX.createElement(X3,null)},renderToolResultMessage(I){if(!I)return gX.createElement(T,null,"No cells found in notebook");if(I.length<1||!I[0])return gX.createElement(T,null,"No cells found in notebook");return gX.createElement(T,null,"Read ",I.length," cells")},async*call({notebook_path:I}){let G=Ig2(I)?I:Gg2(E0(),I),Z=sG9(G,"utf-8"),d=JSON.parse(Z),W=d.metadata.language_info?.name??"python",B=d.cells.map((w,C)=>ZZ9(w,C,W));yield{type:"result",resultForAssis
```

##### Snippet 16

```javascript
e")));case"text":{let{filePath:Z,content:d,numLines:W}=I.file,B=d||"(No content)";return P3.createElement(x,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},P3.createElement(x,{flexDirection:"row"},P3.createElement(T,null,"  ⎿  "),P3.createElement(x,{flexDirection:"column"},P3.createElement(bC,{code:G?B:B.split(`
`).slice(0,Gg1).filter((w)=>w.trim()!=="").join(`
`),language:dw9(Z).slice(1)}),!G&&W>Gg1&&P3.createElement(T,{color:c1().secondaryText},"... (+",W-Gg1," lines)"))))}}},renderToolUseRejectedMessage(){return P3.createElement(X3,null)},async validateInput({file_path:I,offset:G,limit:Z}){let d=x71(I);if(u_(d))return{result:!1,message:"File is in a directory that is ignored by your project configuration."};if(!Zw9(d)){let C=mq(d),V="File does not exist.";if(C)V+=` Did you mean ${C}?`;return{result:!1,message:V}}let B=Ez2(d).size,w=Wg1.extname(d).toLowerCase();if(!Zg1.has(w)){if(B>Bg1&&!G&&!Z)return{result:!1,message:fz2(B),meta:{fileSize:B}}}return{result:!0}},asyn
```

##### Snippet 17

```javascript
).describe("The absolute path to the directory to list (must be absolute, not relative)")}),JZ={name:"LS",async description(){return Vg1},userFacingName(){return"List"},async isEnabled(){return!0},inputSchema:Aw9,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!lC(JZ.getPath(I))},async prompt(){return Vg1},renderResultForAssistant(I){return I},renderToolUseMessage({path:I},{verbose:G}){let Z=I?vz2(I)?I:Sz2(E0(),I):void 0,d=Z?Yg1(E0(),Z):".";return`path: "${G?I:d}"`},renderToolUseRejectedMessage(){return RI.createElement(X3,null)},renderToolResultMessage(I,{verbose:G}){if(typeof I!=="string")return null;let Z=I.replace(Xg1,"");if(!Z)return null;return RI.createElement(x,{justifyContent:"space-between",width:"100%"},RI.createElement(x,null,RI.createElement(T,null,"  ⎿  "),RI.createElement(x,{flexDirection:"column",paddingLeft:0},Z.split(`
`).filter((d)=>d.trim()!=="").slice(0,G?void 0:Ag1).map((d,W)=>RI.createElement(T,{key:W},d)),!G&&Z.split(`
`).length>Ag1&
```

##### Snippet 18

```javascript
(E0(),B);if(!ox(Oz2(dI(),w),Oz2(E0(),dI())))return{result:!1,message:`ERROR: cd to '${w}' was blocked. For security, ${X4} may only change directories to child directories of the original working directory (${dI()}) for this session.`}}}return{result:!0}},renderToolUseMessage({command:I}){if(I.includes(`"$(cat <<'EOF'`)){let G=I.match(/^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/);if(G&&G[1]&&G[2]){let Z=G[1],d=G[2],W=G[3]||"";return`${Z.trim()} "${d.trim()}"${W.trim()}`}}return I},renderToolUseRejectedMessage(){return qO.createElement(X3,null)},renderToolResultMessage(I,{verbose:G}){return qO.createElement(Yo,{content:I,verbose:G})},renderResultForAssistant({interrupted:I,stdout:G,stderr:Z,isImage:d}){if(d){let w=G.trim().match(/^data:([^;]+);base64,(.+)$/);if(w){let C=w[1],V=w[2];return[{type:"image",source:{type:"base64",media_type:C||"image/jpeg",data:V||""}}]}return G.trim()}let W=Z.trim();if(I){if(Z)W+=_o;W+="<error>Command was aborted before completion</error>"}let 
```

##### Snippet 19

```javascript
W){throw(d=this.onerror)===null||d===void 0||d.call(this,W),W}}}var r9=Y1(M1(),1);var IR2="",GR2="";var qA9=s.object({}).passthrough(),ZR2={async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return GR2},async prompt(){return IR2},inputSchema:qA9,async*call(){yield{type:"result",data:"",resultForAssistant:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return r9.createElement(X3,null)},renderToolResultMessage(I,{verbose:G}){if(Array.isArray(I))return r9.createElement(x,{flexDirection:"column"},I.map((d,W)=>{if(d.type==="image")return r9.createElement(x,{key:W,justifyContent:"space-between",overflowX:"hidden",width:"100%"},r9.createElement(x,{flexDirection:"row"},r9.createElement(T,null,"  ⎿  "),r9.createElement(T,null,"[Image]")));let B=d.text.split(`
`).length;return r9.createElement(Jf,{key:W,content:d.text,lin
```

##### Snippet 20

```javascript
o the file to write (must be absolute, not relative)"),content:s.string().describe("The content to write to the file")}),v8={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return NR2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:LN1(E0(),I.file_path)}`},inputSchema:jA9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!Cf(v8.getPath(I))},renderToolUseRejectedMessage({file_path:I,content:G},{columns:Z,verbose:d}){try{let W=SN1(I)?I:$N1(E0(),I),B=MN1(W),w=B?dG(W):"utf-8",C=B?zR2(W,w):null,V=C?"update":"create",A=MX({filePath:I,fileContents:C??"",oldStr:C??"",newStr:G});return _5.createElement(x,{flexDirection:"column"},_5.createElement(T,null,"  ","⎿"," ",_5.createElement(T,{color:c1().error},"User rejected ",V==="update"?"update":"write"," to"," "),_5.createElement(T,{bold:!0},d?I:LN1(E0(),I))),iC(A.map((X)=>_5.createElement(x,{f
```

##### Snippet 21

```javascript
eturn!Cf(NG.getPath(I))},renderResultForAssistant({cell_number:I,edit_mode:G,new_source:Z,error:d}){if(d)return d;switch(G){case"replace":return`Updated cell ${I} with ${Z}`;case"insert":return`Inserted cell ${I} with ${Z}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:iA9(E0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I.edit_mode??"replace"}`},renderToolUseRejectedMessage(){return fI.createElement(X3,null)},renderToolResultMessage({cell_number:I,new_source:G,language:Z,error:d}){if(d)return fI.createElement(x,{flexDirection:"column"},fI.createElement(T,{color:"red"},d));return fI.createElement(x,{flexDirection:"column"},fI.createElement(T,null,"Updated cell ",I,":"),fI.createElement(x,{marginLeft:2},fI.createElement(bC,{code:G,language:Z})))},async validateInput({notebook_path:I,cell_number:G,cell_type:Z,edit_mode:d="replace"}){let W=
```

##### Snippet 22

```javascript
(){return PR2},userFacingName({old_string:I,new_string:G}){if(I==="")return"Create";if(G==="")return"Delete";return"Update"},async isEnabled(){return!0},inputSchema:IX9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!Cf(I.file_path)},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:uR2(E0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:G},{verbose:Z}){return T3.createElement(Ze,{filePath:I,structuredPatch:G,verbose:Z})},renderToolUseRejectedMessage({file_path:I,old_string:G,new_string:Z},{columns:d,verbose:W}){try{let{patch:B}=ON1(I,G,Z);return T3.createElement(x,{flexDirection:"column"},T3.createElement(T,null,"  ","⎿"," ",T3.createElement(T,{color:c1().error},"User rejected ",G===""?"write":"update"," to"," "),T3.createElement(T,{bold:!0},W?I:uR2(E0(),I))),iC(B.map((w)=>T3.createElement(x,{flexDirection:"column",paddingLeft:5,key:w.newStart},T3.createElement(sd,{patch:w,dim:!0,width:d-12}))),(w)=>T3.createEle
```

##### Snippet 23

```javascript
ribe("The directory to search in. Defaults to the current working directory.")}),r7={name:Ao,async description(){return wg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:KX9,isReadOnly(){return!0},getPath({path:I}){return I||E0()},needsPermissions(I){return!lC(r7.getPath(I))},async prompt(){return wg1},renderToolUseMessage({pattern:I,path:G},{verbose:Z}){let d=G?HX9(G)?G:JX9(E0(),G):void 0,W=d?FX9(E0(),d):void 0;return`pattern: "${I}"${W||Z?`, path: "${Z?d:W}"`:""}`},renderToolUseRejectedMessage(){return TH.default.createElement(X3,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return TH.default.createElement(x,{justifyContent:"space-between",width:"100%"},TH.default.createElement(x,{flexDirection:"row"},TH.default.createElement(T,null,"  ⎿  Found "),TH.default.createElement(T,{bold:!0},I.numFiles," "),TH.default.createElement(T,null,I.numFiles===0||I.numFiles>1?"files":"file")),TH.default.createElement(OH,{costUSD:0,durationMs:I.du
```

##### Snippet 24

```javascript
clude in the search (e.g. "*.js", "*.{ts,tsx}")')}),aR2=100,yB={name:Xo,async description(){return Cg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:NX9,isReadOnly(){return!0},getPath({path:I}){return I||E0()},needsPermissions({path:I}){return!lC(I||E0())},async prompt(){return Cg1},renderToolUseMessage({pattern:I,path:G,include:Z},{verbose:d}){let{absolutePath:W,relativePath:B}=f90(G);return`pattern: "${I}"${B||d?`, path: "${d?W:B}"`:""}${Z?`, include: "${Z}"`:""}`},renderToolUseRejectedMessage(){return uH.default.createElement(X3,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return uH.default.createElement(x,{justifyContent:"space-between",width:"100%"},uH.default.createElement(x,{flexDirection:"row"},uH.default.createElement(T,null,"  ⎿  Found "),uH.default.createElement(T,{bold:!0},I.numFiles," "),uH.default.createElement(T,null,I.numFiles===0||I.numFiles>1?"files":"file")),uH.default.createElement(OH,{costUSD:0,durationMs:I.durationMs,deb
```

##### Snippet 25

```javascript
return Z}function Ce(I,G,Z){return rR2.useMemo(()=>{let d=zX9(I,Z);if(!d)throw new ReferenceError(`Tool use not found for tool_use_id ${I}`);let W=[...G,r7,yB].find((B)=>B.name===d.name);if(W===r7||W===yB)s1("tengu_legacy_tool_lookup",{});if(!W)throw new ReferenceError(`Tool not found for ${d.name}`);return{tool:W,toolUse:d}},[I,Z,G])}function sR2({toolUseID:I,tools:G,messages:Z,verbose:d}){let{columns:W}=q9(),{tool:B,toolUse:w}=Ce(I,G,Z),C=B.inputSchema.safeParse(w.input);if(C.success)return B.renderToolUseRejectedMessage(C.data,{columns:W,verbose:d});return lN1.createElement(X3,null)}var jN1=Y1(M1(),1);function oR2({param:I,message:G,messages:Z,tools:d,verbose:W,width:B}){let{tool:w}=Ce(I.tool_use_id,d,Z);return jN1.createElement(x,{flexDirection:"column",width:B},w.renderToolResultMessage?.(G.toolUseResult.data,{verbose:W}))}function eR2({param:I,message:G,messages:Z,tools:d,verbose:W,width:B}){if(I.content===yf)return SX.createElement(iR2,null);if(I.content===tO)return SX.createEle
```

##### Snippet 26

```javascript
gName:()=>"Think",description:async()=>IU2,inputSchema:QX9,isEnabled:async()=>Boolean(process.env.THINK_TOOL)&&await yY("tengu_think_tool"),isReadOnly:()=>!0,needsPermissions:()=>!1,prompt:async()=>GU2,async*call(I,{messageId:G}){s1("tengu_thinking",{messageId:G,thoughtLength:I.thought.length.toString(),method:"tool",provider:x9?"bedrock":c9?"vertex":"1p"}),yield{type:"result",resultForAssistant:"Your thought has been logged.",data:{thought:I.thought}}},renderToolUseMessage(I){return I.thought},renderToolUseRejectedMessage(){return kN1.default.createElement(eO,null,kN1.default.createElement(T,{color:c1().error},"Thought cancelled"))},renderResultForAssistant:()=>"Your thought has been logged."};var YT=Y1(M1(),1);function xN1(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var Pg=xN1();function CU2(I){Pg=I}var BT={exec:()=>null};function d9(I,G=""){let Z=typeof I==="string"?I:I.source,d={replace:(W,B)=>{le
```

##### Snippet 27

```javascript
d{type:"progress",content:E8(`Done (${$.join(" · ")})`),normalizedMessages:z,tools:A}}let S=U.message.content.filter(($)=>$.type==="text");yield{type:"result",data:S,normalizedMessages:z,resultForAssistant:this.renderResultForAssistant(S),tools:A}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:G}){let Z=I.split(KD9);return Of(!G&&Z.length>1?Z[0]+"…":I)},renderToolUseRejectedMessage(){return Lz1.createElement(X3,null)}};var ug=Y1(M1(),1);var if2=`You are an expert software architect. Your role is to analyze technical requirements and produce clear, actionable implementation plans.
These plans will then be carried out by a junior software engineer so you need to be specific and detailed. However do not actually write the code, just explain the plan.

Follow these steps for each request:
1. Carefully analyze requirements to identify core functiona
```

##### Snippet 28

```javascript
nvalid response from Claude API");let A=V.message.content.filter((X)=>X.type==="text");yield{type:"result",data:A,resultForAssistant:this.renderResultForAssistant(A)}},async prompt(){return $z1},renderResultForAssistant(I){return I},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},renderToolResultMessage(I){return ug.createElement(x,{flexDirection:"column",gap:1},ug.createElement(bC,{code:I.map((G)=>G.text).join(`
`),language:"markdown"}))},renderToolUseRejectedMessage(){return ug.createElement(X3,null)}};var QD9=Y1(M1(),1);var Jc3=s.strictObject({file_path:s.string().optional().describe("Optional path to a specific memory file to read")});var qD9=Y1(M1(),1);var Ec3=s.strictObject({file_path:s.string().describe("Path to the memory file to write"),content:s.string().describe("Content to write to the file")});var Te=Y1(M1(),1);var af2="Sends the user swag stickers with love from Anthropic.",rf2=`This tool should be used whenever a us
```

##### Snippet 29

```javascript
s_optional_address:Boolean(B.address2).toString()}),Z(!0),G.setToolJSX?.(null)},onClose:()=>{s1("sticker_request_form_cancelled",{}),Z(!1),G.setToolJSX?.(null)}}),shouldHidePromptInput:!0});let W=await d;if(!W)throw G.abortController.abort(),new Error("Sticker request cancelled");yield{type:"result",resultForAssistant:"Sticker request completed! Please tell the user that they will receive stickers in the mail if they have submitted the form!",data:{success:W}}},renderToolUseMessage(I){return""},renderToolUseRejectedMessage:(I)=>Te.default.createElement(T,null,"  ⎿  ",Te.default.createElement(T,{color:c1().error},"No (Sticker request cancelled)")),renderResultForAssistant:(I)=>I};var GE2=()=>{return[mf,d5,r7,yB,JZ,FZ,a7,v8,gg,NG,IE2,$g,...[]]},Pe=r2(async(I)=>{let G=[...GE2(),...await HR2()];if(I)G.push(nf2);let Z=await Promise.all(G.map((d)=>d.isEnabled()));return G.filter((d,W)=>Z[W])}),pf2=r2(async()=>{let I=GE2().filter((Z)=>Z.isReadOnly()),G=await Promise.all(I.map((Z)=>Z.isEnabled
```

### Version 0.2.30

No structured code could be extracted.

#### Raw Snippets

##### Snippet 1

```javascript
ute path to the Jupyter notebook file to read (must be absolute, not relative)")});function zg2(I){return I.flatMap(lZ9).reduce((Z,d)=>{if(Z.length===0)return[d];let W=Z[Z.length-1];if(W&&W.type==="text"&&d.type==="text")return W.text+=`
`+d.text,Z;return[...Z,d]},[])}var EX={name:"ReadNotebook",async description(){return Fg2},async prompt(){return Jg2},userFacingName(){return"Read Notebook"},async isEnabled(){return!0},inputSchema:yZ9,isReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!iC(EX.getPath(I))},async validateInput({notebook_path:I}){let G=gg2(I)?I:Ng2(U0(),I);if(!SZ9(G)){let Z=pq(G),d="File does not exist.";if(Z)d+=` Did you mean ${Z}?`;return{result:!1,message:d}}if($Z9(G)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:PZ9(U0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return fX.createElement(S3,n
```

##### Snippet 2

```javascript
 path to the file to read"),offset:o.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:o.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),MI={name:"View",async description(){return Qg2},async prompt(){return qg2},inputSchema:lw9,userFacingName(){return"Read"},async isEnabled(){return!0},isReadOnly(){return!0},getPath({file_path:I}){return I||U0()},needsPermissions(I){return!iC(MI.getPath(I))},renderToolUseMessage(I,{verbose:G}){let{file_path:Z,...d}=I;return[["file_path",G?Z:bw9(U0(),Z)],...Object.entries(d)].map(([B,w])=>`${B}: ${JSON.stringify(w)}`).join(", ")},renderToolResultMessage(I,{verbose:G}){switch(I.type){case"image":return L3.createElement(a,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},L3.createElement(a,{flexDirection:"row"},L3.createElement(m,null,"  ⎿  "),L3.createElement(m,null,"Read image")));case"text
```

##### Snippet 3

```javascript
 Bash tool, and other tools to explore nested directories. The first ${LO} files and directories are included below:

`,AC9=o.strictObject({path:o.string().describe("The absolute path to the directory to list (must be absolute, not relative)"),ignore:o.array(o.string()).optional().describe("List of glob patterns to ignore")}),LI={name:"LS",async description(){return Rg1},userFacingName(){return"List"},async isEnabled(){return!0},inputSchema:AC9,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!iC(LI.getPath(I))},async prompt(){return Rg1},renderResultForAssistant(I){return I},renderToolUseMessage({path:I,ignore:G},{verbose:Z}){let d=I?ZQ2(I)?I:WQ2(U0(),I):void 0,W=d?Mo(U0(),d):".",B=`path: "${Z?I:W}"`;if(G&&G.length>0)B+=`, ignore: ${G.join(", ")}`;return B},renderToolUseRejectedMessage(){return SI.createElement(S3,null)},renderToolResultMessage(I,{verbose:G}){if(typeof I!=="string")return null;let Z=I.replace(Lg1,"");if(!Z)return null;return SI.createElemen
```

##### Snippet 4

```javascript
put: Shows working tree status

          Input: npm install
          Output: Installs package dependencies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`});return(G.message.content[0]?.type==="text"?G.message.content[0].text:null)||"Executes a bash command"}catch(G){return Z0(G),"Executes a bash command"}},async prompt(){return VQ2},isReadOnly(){return!1},inputSchema:yO,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let G=oR(I);for(let Z of G){let d=Z.split(" "),W=d[0];if(W&&$g1.includes(W.toLowerCase()))return{result:!1,message:`Command '${W}' is not allowed for security reasons`};if(W==="cd"&&d[1]){let B=d[1].replace(/^['"]|['"]$/g,""),w=AQ2(B)?B:YQ2(U0(),B);if(!Xc(XQ2(VI(),w),XQ2(U0(),VI())))return{result:!1,message:`ERROR: cd to '${w}' was blocked. For security, ${l2} may only change directories to child directories of the original working di
```

##### Snippet 5

```javascript
},w=await fetch(this._endpoint,B);if(!w.ok){let C=await w.text().catch(()=>null);throw new Error(`Error POSTing to endpoint (HTTP ${w.status}): ${C}`)}}catch(W){throw(d=this.onerror)===null||d===void 0||d.call(this,W),W}}}var n9=X1(M1(),1);var yU2="",OU2="";var OX9=o.object({}).passthrough(),TU2={async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return OU2},async prompt(){return yU2},inputSchema:OX9,async*call(){yield{type:"result",data:"",resultForAssistant:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return n9.createElement(S3,null)},renderToolResultMessage(I,{verbose:G}){if(Array.isArray(I))return n9.createElement(a,{flexDirection:"column"},I.map((d,W)=>{if(d.type==="image")return n9.createElement(a,{key:W,justifyContent:"space-between",overflowX:"hidden",width:"100%"},n9.createElement(a,{flexDirection:"r
```

##### Snippet 6

```javascript
_path:o.string().describe("The absolute path to the file to write (must be absolute, not relative)"),content:o.string().describe("The content to write to the file")}),T6={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return oU2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:sN1(U0(),I.file_path)}`},inputSchema:GY9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!Ff(T6.getPath(I))},renderToolUseRejectedMessage({file_path:I,content:G},{columns:Z,verbose:d}){try{let W=rN1(I)?I:oN1(U0(),I),B=aN1(W),w=B?YG(W):"utf-8",C=B?eU2(W,w):null,V=C?"update":"create",A=mX({filePath:I,fileContents:C??"",oldStr:C??"",newStr:G});return _5.createElement(a,{flexDirection:"column"},_5.createElement(m,null,"  ","⎿"," ",_5.createElement(m,{color:p1().error},"User rejected ",V==="update"?"update":"write"," to"," "),_5.createElement(m,{bold:!0},d?I:sN1
```

##### Snippet 7

```javascript
scribe("The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required."),edit_mode:o.string().optional().describe("The type of edit to make (replace, insert, delete). Defaults to replace.")}),II={name:"NotebookEditCell",async description(){return wR2},async prompt(){return CR2},userFacingName(){return"Edit Notebook"},async isEnabled(){return!0},inputSchema:VY9,isReadOnly(){return!1},getPath(I){return I.notebook_path},needsPermissions(I){return!Ff(II.getPath(I))},renderResultForAssistant({cell_number:I,edit_mode:G,new_source:Z,error:d}){if(d)return d;switch(G){case"replace":return`Updated cell ${I} with ${Z}`;case"insert":return`Inserted cell ${I} with ${Z}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:CY9(U0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I.edi
```

##### Snippet 8

```javascript
File:W}}var JY9=o.strictObject({file_path:o.string().describe("The absolute path to the file to modify"),old_string:o.string().describe("The text to replace"),new_string:o.string().describe("The text to replace it with")}),JR2=4;var L8={name:"Edit",async description(){return"A tool for editing files"},async prompt(){return YR2},userFacingName({old_string:I}){if(I==="")return"Create";return"Update"},async isEnabled(){return!0},inputSchema:JY9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!Ff(I.file_path)},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:HR2(U0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:G},{verbose:Z}){return P3.createElement(qe,{filePath:I,structuredPatch:G,verbose:Z})},renderToolUseRejectedMessage({file_path:I,old_string:G,new_string:Z},{columns:d,verbose:W}){try{let{patch:B}=CT(I,G,Z);return P3.createElement(a,{flexDirection:"column"},P3.createElement(m,null,"  ","⎿"," ",P3.createElement
```

##### Snippet 9

```javascript
mColor:!0},"Cost: $",I.toFixed(4)," (",d,"s)"))}import{isAbsolute as MY9,relative as SY9,resolve as LY9}from"path";var $Y9=o.strictObject({pattern:o.string().describe("The glob pattern to match files against"),path:o.string().optional().describe("The directory to search in. Defaults to the current working directory.")}),$8={name:Ro,async description(){return qg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:$Y9,isReadOnly(){return!0},getPath({path:I}){return I||U0()},needsPermissions(I){return!iC($8.getPath(I))},async prompt(){return qg1},renderToolUseMessage({pattern:I,path:G},{verbose:Z}){let d=G?MY9(G)?G:LY9(U0(),G):void 0,W=d?SY9(U0(),d):void 0;return`pattern: "${I}"${W||Z?`, path: "${Z?d:W}"`:""}`},renderToolUseRejectedMessage(){return bH.default.createElement(S3,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return bH.default.createElement(a,{justifyContent:"space-between",width:"100%"},bH.default.createElement(a,{flexDirectio
```

##### Snippet 10

```javascript
{pattern:o.string().describe("The regular expression pattern to search for in file contents"),path:o.string().optional().describe("The directory to search in. Defaults to the current working directory."),include:o.string().optional().describe('File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")')}),SR2=100,fZ={name:fo,async description(){return Ug1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:yY9,isReadOnly(){return!0},getPath({path:I}){return I||U0()},needsPermissions({path:I}){return!iC(I||U0())},async prompt(){return Ug1},renderToolUseMessage({pattern:I,path:G,include:Z},{verbose:d}){let{absolutePath:W,relativePath:B}=c90(G);return`pattern: "${I}"${B||d?`, path: "${d?W:B}"`:""}${Z?`, include: "${Z}"`:""}`},renderToolUseRejectedMessage(){return lH.default.createElement(S3,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return lH.default.createElement(a,{justifyContent:"space-between",width:"100%"},lH.default.createElement(a,{fle
```

##### Snippet 11

```javascript
equested permissions to use ${I.name}, but you haven't granted it yet.`};if(B.every((C)=>{let V=w.subcommandPrefixes.get(C);if(V===void 0||V.commandInjectionDetected)return!1;return Xf2(I,C,V?V.commandPrefix:null,d)}))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}},xH=async(I,G,Z,d)=>{if(Z.options.permissionMode==="dangerouslySkipPermissions")return{result:!0};if(Z.abortController.signal.aborted)throw new WQ;try{if(!I.needsPermissions(G))return{result:!0}}catch(w){return Z0(`Error checking permissions: ${w}`),{result:!1,message:"Error checking permissions"}}let B=B4().allowedTools??[];if(I===o4&&B.includes(o4.name))return{result:!0};switch(I){case o4:{let{command:w}=yO.parse(G);return await U_9(I,w,Z,B)}case L8:case T6:case II:{if(!I.needsPermissions(G))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}default:{let w=fT(I,G,null);if(B.
```

##### Snippet 12

```javascript
't granted it yet.`}},xH=async(I,G,Z,d)=>{if(Z.options.permissionMode==="dangerouslySkipPermissions")return{result:!0};if(Z.abortController.signal.aborted)throw new WQ;try{if(!I.needsPermissions(G))return{result:!0}}catch(w){return Z0(`Error checking permissions: ${w}`),{result:!1,message:"Error checking permissions"}}let B=B4().allowedTools??[];if(I===o4&&B.includes(o4.name))return{result:!0};switch(I){case o4:{let{command:w}=yO.parse(G);return await U_9(I,w,Z,B)}case L8:case T6:case II:{if(!I.needsPermissions(G))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}default:{let w=fT(I,G,null);if(B.includes(w))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}}};async function lX(I,G,Z){let d=fT(I,G,Z);if(I===L8||I===T6||I===II){Go();return}let W=B4();if(W.allowedTools.includes(d))return;W.allowedTools.push(d),W.allowedTools.sort(),V9(W)}fun
```

##### Snippet 13

```javascript
ns??0)+(R.message.usage.cache_read_input_tokens??0)+R.message.usage.input_tokens+R.message.usage.output_tokens)+" tokens",cy(Date.now()-C)];yield{type:"progress",content:G8({content:`Done (${$.join(" · ")})`,surface:"both"}),normalizedMessages:Q,tools:V}}let S=R.message.content.filter(($)=>$.type==="text");yield{type:"result",data:S,normalizedMessages:Q,resultForAssistant:this.renderResultForAssistant(S),tools:V}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:G}){let Z=I.split(LH9);return xf(!G&&Z.length>1?Z[0]+"…":I)},renderToolUseRejectedMessage(){return nz1.createElement(S3,null)}};var jg=X1(M1(),1);var SE2=`You are an expert software architect. Your role is to analyze technical requirements and produce clear, actionable implementation plans.
These plans will then be carried out by a junior software engineer so you need to be specific and de
```

##### Snippet 14

```javascript
 whenever you need help planning how to implement a feature, solve a technical problem, or structure your code.";var PH9=[o4,LI,MI,T6,$8,fZ],yH9=o.strictObject({prompt:o.string().describe("The technical request or coding task to analyze"),context:o.string().describe("Optional context from previous conversation or system state").optional()}),LE2={name:"Architect",async description(){return az1},inputSchema:yH9,isReadOnly(){return!0},userFacingName(){return"Architect"},async isEnabled(){return!1},needsPermissions(){return!1},async*call({prompt:I,context:G},Z,d){let W=G?`<context>${G}</context>

${I}`:I,B=(Z.options.tools??[]).filter((X)=>PH9.map((Y)=>Y.name).includes(X.name)),C=[Q5({content:W,surface:"both"})],V=await PX(IV(C,[SE2],await s7(),d,{...Z,options:{...Z.options,tools:B}}));if(V.type!=="assistant")throw new Error("Invalid response from Claude API");let A=V.message.content.filter((X)=>X.type==="text");yield{type:"result",data:A,resultForAssistant:this.renderResultForAssistant(A)
```

##### Snippet 15

```javascript
sReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!iC(EX.getPath(I))},async validateInput({notebook_path:I}){let G=gg2(I)?I:Ng2(U0(),I);if(!SZ9(G)){let Z=pq(G),d="File does not exist.";if(Z)d+=` Did you mean ${Z}?`;return{result:!1,message:d}}if($Z9(G)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:PZ9(U0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return fX.createElement(S3,null)},renderToolResultMessage(I){if(!I)return fX.createElement(m,null,"No cells found in notebook");if(I.length<1||!I[0])return fX.createElement(m,null,"No cells found in notebook");return fX.createElement(m,null,"Read ",I.length," cells")},async*call({notebook_path:I}){let G=gg2(I)?I:Ng2(U0(),I),Z=LZ9(G,"utf-8"),d=JSON.parse(Z),W=d.metadata.language_info?.name??"python",B=d.cells.map((w,C)=>uZ9(w,C,W));yield{type:"result",resultForAssis
```

##### Snippet 16

```javascript
e")));case"text":{let{filePath:Z,content:d,numLines:W}=I.file,B=d||"(No content)";return L3.createElement(a,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},L3.createElement(a,{flexDirection:"row"},L3.createElement(m,null,"  ⎿  "),L3.createElement(a,{flexDirection:"column"},L3.createElement(pC,{code:G?B:B.split(`
`).slice(0,Kg1).filter((w)=>w.trim()!=="").join(`
`),language:mw9(Z).slice(1)}),!G&&W>Kg1&&L3.createElement(m,{color:p1().secondaryText},"... (+",W-Kg1," lines)"))))}}},renderToolUseRejectedMessage(){return L3.createElement(S3,null)},async validateInput({file_path:I,offset:G,limit:Z}){let d=BI1(I);if(k_(d))return{result:!1,message:"File is in a directory that is ignored by your project configuration."};if(!uw9(d)){let C=pq(d),V="File does not exist.";if(C)V+=` Did you mean ${C}?`;return{result:!1,message:V}}let B=cz2(d).size,w=zg1.extname(d).toLowerCase();if(!gg1.has(w)){if(B>Qg1&&!G&&!Z)return{result:!1,message:xz2(B),meta:{fileSize:B}}}return{result:!0}},asyn
```

##### Snippet 17

```javascript
of glob patterns to ignore")}),LI={name:"LS",async description(){return Rg1},userFacingName(){return"List"},async isEnabled(){return!0},inputSchema:AC9,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!iC(LI.getPath(I))},async prompt(){return Rg1},renderResultForAssistant(I){return I},renderToolUseMessage({path:I,ignore:G},{verbose:Z}){let d=I?ZQ2(I)?I:WQ2(U0(),I):void 0,W=d?Mo(U0(),d):".",B=`path: "${Z?I:W}"`;if(G&&G.length>0)B+=`, ignore: ${G.join(", ")}`;return B},renderToolUseRejectedMessage(){return SI.createElement(S3,null)},renderToolResultMessage(I,{verbose:G}){if(typeof I!=="string")return null;let Z=I.replace(Lg1,"");if(!Z)return null;return SI.createElement(a,{justifyContent:"space-between",width:"100%"},SI.createElement(a,null,SI.createElement(m,null,"  ⎿  "),SI.createElement(a,{flexDirection:"column",paddingLeft:0},Z.split(`
`).filter((d)=>d.trim()!=="").slice(0,G?void 0:Sg1).map((d,W)=>SI.createElement(m,{key:W},d)),!G&&Z.split(`
`).length>Sg1&
```

##### Snippet 18

```javascript
(U0(),B);if(!Xc(XQ2(VI(),w),XQ2(U0(),VI())))return{result:!1,message:`ERROR: cd to '${w}' was blocked. For security, ${l2} may only change directories to child directories of the original working directory (${VI()}) for this session.`}}}return{result:!0}},renderToolUseMessage({command:I}){if(I.includes(`"$(cat <<'EOF'`)){let G=I.match(/^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/);if(G&&G[1]&&G[2]){let Z=G[1],d=G[2],W=G[3]||"";return`${Z.trim()} "${d.trim()}"${W.trim()}`}}return I},renderToolUseRejectedMessage(){return PO.createElement(S3,null)},renderToolResultMessage(I,{verbose:G}){return PO.createElement(Lo,{content:I,verbose:G})},renderResultForAssistant({interrupted:I,stdout:G,stderr:Z,isImage:d}){if(d){let w=G.trim().match(/^data:([^;]+);base64,(.+)$/);if(w){let C=w[1],V=w[2];return[{type:"image",source:{type:"base64",media_type:C||"image/jpeg",data:V||""}}]}return G.trim()}let W=Z.trim();if(I){if(Z)W+=$o;W+="<error>Command was aborted before completion</error>"}let 
```

##### Snippet 19

```javascript
W){throw(d=this.onerror)===null||d===void 0||d.call(this,W),W}}}var n9=X1(M1(),1);var yU2="",OU2="";var OX9=o.object({}).passthrough(),TU2={async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return OU2},async prompt(){return yU2},inputSchema:OX9,async*call(){yield{type:"result",data:"",resultForAssistant:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return n9.createElement(S3,null)},renderToolResultMessage(I,{verbose:G}){if(Array.isArray(I))return n9.createElement(a,{flexDirection:"column"},I.map((d,W)=>{if(d.type==="image")return n9.createElement(a,{key:W,justifyContent:"space-between",overflowX:"hidden",width:"100%"},n9.createElement(a,{flexDirection:"row"},n9.createElement(m,null,"  ⎿  "),n9.createElement(m,null,"[Image]")));let B=d.text.split(`
`).length;return n9.createElement(ff,{key:W,content:d.text,lin
```

##### Snippet 20

```javascript
o the file to write (must be absolute, not relative)"),content:o.string().describe("The content to write to the file")}),T6={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return oU2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:sN1(U0(),I.file_path)}`},inputSchema:GY9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!Ff(T6.getPath(I))},renderToolUseRejectedMessage({file_path:I,content:G},{columns:Z,verbose:d}){try{let W=rN1(I)?I:oN1(U0(),I),B=aN1(W),w=B?YG(W):"utf-8",C=B?eU2(W,w):null,V=C?"update":"create",A=mX({filePath:I,fileContents:C??"",oldStr:C??"",newStr:G});return _5.createElement(a,{flexDirection:"column"},_5.createElement(m,null,"  ","⎿"," ",_5.createElement(m,{color:p1().error},"User rejected ",V==="update"?"update":"write"," to"," "),_5.createElement(m,{bold:!0},d?I:sN1(U0(),I))),tC(A.map((X)=>_5.createElement(a,{f
```

##### Snippet 21

```javascript
eturn!Ff(II.getPath(I))},renderResultForAssistant({cell_number:I,edit_mode:G,new_source:Z,error:d}){if(d)return d;switch(G){case"replace":return`Updated cell ${I} with ${Z}`;case"insert":return`Inserted cell ${I} with ${Z}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:CY9(U0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I.edit_mode??"replace"}`},renderToolUseRejectedMessage(){return PI.createElement(S3,null)},renderToolResultMessage({cell_number:I,new_source:G,language:Z,error:d}){if(d)return PI.createElement(a,{flexDirection:"column"},PI.createElement(m,{color:"red"},d));return PI.createElement(a,{flexDirection:"column"},PI.createElement(m,null,"Updated cell ",I,":"),PI.createElement(a,{marginLeft:2},PI.createElement(pC,{code:G,language:Z})))},async validateInput({notebook_path:I,cell_number:G,cell_type:Z,edit_mode:d="replace"}){let W=
```

##### Snippet 22

```javascript
 tool for editing files"},async prompt(){return YR2},userFacingName({old_string:I}){if(I==="")return"Create";return"Update"},async isEnabled(){return!0},inputSchema:JY9,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I){return!Ff(I.file_path)},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:HR2(U0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:G},{verbose:Z}){return P3.createElement(qe,{filePath:I,structuredPatch:G,verbose:Z})},renderToolUseRejectedMessage({file_path:I,old_string:G,new_string:Z},{columns:d,verbose:W}){try{let{patch:B}=CT(I,G,Z);return P3.createElement(a,{flexDirection:"column"},P3.createElement(m,null,"  ","⎿"," ",P3.createElement(m,{color:p1().error},"User rejected ",G===""?"write":"update"," to"," "),P3.createElement(m,{bold:!0},W?I:HR2(U0(),I))),tC(B.map((w)=>P3.createElement(a,{flexDirection:"column",paddingLeft:5,key:w.newStart},P3.createElement(GW,{patch:w,dim:!0,width:d-12}))),(w)=>P3.createElem
```

##### Snippet 23

```javascript
ribe("The directory to search in. Defaults to the current working directory.")}),$8={name:Ro,async description(){return qg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:$Y9,isReadOnly(){return!0},getPath({path:I}){return I||U0()},needsPermissions(I){return!iC($8.getPath(I))},async prompt(){return qg1},renderToolUseMessage({pattern:I,path:G},{verbose:Z}){let d=G?MY9(G)?G:LY9(U0(),G):void 0,W=d?SY9(U0(),d):void 0;return`pattern: "${I}"${W||Z?`, path: "${Z?d:W}"`:""}`},renderToolUseRejectedMessage(){return bH.default.createElement(S3,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return bH.default.createElement(a,{justifyContent:"space-between",width:"100%"},bH.default.createElement(a,{flexDirection:"row"},bH.default.createElement(m,null,"  ⎿  Found "),bH.default.createElement(m,{bold:!0},I.numFiles," "),bH.default.createElement(m,null,I.numFiles===0||I.numFiles>1?"files":"file")),bH.default.createElement(mH,{costUSD:0,durationMs:I.du
```

##### Snippet 24

```javascript
clude in the search (e.g. "*.js", "*.{ts,tsx}")')}),SR2=100,fZ={name:fo,async description(){return Ug1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:yY9,isReadOnly(){return!0},getPath({path:I}){return I||U0()},needsPermissions({path:I}){return!iC(I||U0())},async prompt(){return Ug1},renderToolUseMessage({pattern:I,path:G,include:Z},{verbose:d}){let{absolutePath:W,relativePath:B}=c90(G);return`pattern: "${I}"${B||d?`, path: "${d?W:B}"`:""}${Z?`, include: "${Z}"`:""}`},renderToolUseRejectedMessage(){return lH.default.createElement(S3,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return lH.default.createElement(a,{justifyContent:"space-between",width:"100%"},lH.default.createElement(a,{flexDirection:"row"},lH.default.createElement(m,null,"  ⎿  Found "),lH.default.createElement(m,{bold:!0},I.numFiles," "),lH.default.createElement(m,null,I.numFiles===0||I.numFiles>1?"files":"file")),lH.default.createElement(mH,{costUSD:0,durationMs:I.durationMs,deb
```

##### Snippet 25

```javascript
return Z}function ve(I,G,Z){return LR2.useMemo(()=>{let d=OY9(I,Z);if(!d)throw new ReferenceError(`Tool use not found for tool_use_id ${I}`);let W=[...G,$8,fZ].find((B)=>B.name===d.name);if(W===$8||W===fZ)I0("tengu_legacy_tool_lookup",{});if(!W)throw new ReferenceError(`Tool not found for ${d.name}`);return{tool:W,toolUse:d}},[I,Z,G])}function $R2({toolUseID:I,tools:G,messages:Z,verbose:d}){let{columns:W}=O9(),{tool:B,toolUse:w}=ve(I,G,Z),C=B.inputSchema.safeParse(w.input);if(C.success)return B.renderToolUseRejectedMessage(C.data,{columns:W,verbose:d});return Wz1.createElement(S3,null)}var Bz1=X1(M1(),1);function PR2({param:I,message:G,messages:Z,tools:d,verbose:W,width:B}){let{tool:w}=ve(I.tool_use_id,d,Z);if(!G.toolUseResult)return null;return Bz1.createElement(a,{flexDirection:"column",width:B},w.renderToolResultMessage?.(G.toolUseResult.data,{verbose:W}))}function yR2({param:I,message:G,messages:Z,tools:d,verbose:W,width:B}){if(I.content===kf)return bX.createElement(vR2,null);if(I.
```

##### Snippet 26

```javascript
:G8({content:`Done (${$.join(" · ")})`,surface:"both"}),normalizedMessages:Q,tools:V}}let S=R.message.content.filter(($)=>$.type==="text");yield{type:"result",data:S,normalizedMessages:Q,resultForAssistant:this.renderResultForAssistant(S),tools:V}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:G}){let Z=I.split(LH9);return xf(!G&&Z.length>1?Z[0]+"…":I)},renderToolUseRejectedMessage(){return nz1.createElement(S3,null)}};var jg=X1(M1(),1);var SE2=`You are an expert software architect. Your role is to analyze technical requirements and produce clear, actionable implementation plans.
These plans will then be carried out by a junior software engineer so you need to be specific and detailed. However do not actually write the code, just explain the plan.

Follow these steps for each request:
1. Carefully analyze requirements to identify core functiona
```

##### Snippet 27

```javascript
nvalid response from Claude API");let A=V.message.content.filter((X)=>X.type==="text");yield{type:"result",data:A,resultForAssistant:this.renderResultForAssistant(A)}},async prompt(){return az1},renderResultForAssistant(I){return I},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},renderToolResultMessage(I){return jg.createElement(a,{flexDirection:"column",gap:1},jg.createElement(pC,{code:I.map((G)=>G.text).join(`
`),language:"markdown"}))},renderToolUseRejectedMessage(){return jg.createElement(S3,null)}};var OH9=X1(M1(),1);var zi3=E2(async()=>{let I=[iH,o4,$8,fZ,LI,MI,L8,T6,EX,II,...await Ne()],G=await Promise.all(I.map((Z)=>Z.isEnabled()));return I.filter((Z,d)=>G[d])});var Li3=o.strictObject({invocations:o.array(o.object({tool_name:o.string().describe("The name of the tool to invoke"),input:o.record(o.any()).describe("The input to pass to the tool")})).describe("The list of tool invocations to execute")});var PT=E2(async(I)=>{le
```

### Version 0.2.35

No structured code could be extracted.

#### Raw Snippets

##### Snippet 1

```javascript
ute path to the Jupyter notebook file to read (must be absolute, not relative)")});function Dv2(I){return I.flatMap(KK3).reduce((Z,d)=>{if(Z.length===0)return[d];let W=Z[Z.length-1];if(W&&W.type==="text"&&d.type==="text")return W.text+=`
`+d.text,Z;return[...Z,d]},[])}var YV={name:"ReadNotebook",async description(){return Xv2},async prompt(){return Yv2},userFacingName(){return"Read Notebook"},async isEnabled(){return!0},inputSchema:AK3,isReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!PX(YV.getPath(I))},async validateInput({notebook_path:I}){let G=_v2(I)?I:Hv2(u0(),I);if(!VK3(G)){let Z=nf(G),d="File does not exist.";if(Z)d+=` Did you mean ${Z}?`;return{result:!1,message:d}}if(XK3(G)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:YK3(u0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return sA.createElement(E5,n
```

##### Snippet 2

```javascript
 path to the file to read"),offset:e.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:e.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),_G={name:"View",async description(){return Fv2},async prompt(){return Jv2},inputSchema:Kq3,userFacingName(){return"Read"},async isEnabled(){return!0},isReadOnly(){return!0},getPath({file_path:I}){return I||u0()},needsPermissions(I){return!PX(_G.getPath(I))},renderToolUseMessage(I,{verbose:G}){let{file_path:Z,...d}=I;return[["file_path",G?Z:Jq3(u0(),Z)],...Object.entries(d)].map(([B,w])=>`${B}: ${JSON.stringify(w)}`).join(", ")},renderToolResultMessage(I,{verbose:G}){switch(I.type){case"image":return D6.createElement(p,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},D6.createElement(p,{flexDirection:"row"},D6.createElement(O,null,"  ⎿  "),D6.createElement(O,null,"Read image")));case"text
```

##### Snippet 3

```javascript
 Bash tool, and other tools to explore nested directories. The first ${dT} files and directories are included below:

`,kq3=e.strictObject({path:e.string().describe("The absolute path to the directory to list (must be absolute, not relative)"),ignore:e.array(e.string()).optional().describe("List of glob patterns to ignore")}),fI={name:"LS",async description(){return GU1},userFacingName(){return"List"},async isEnabled(){return!0},inputSchema:kq3,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!PX(fI.getPath(I))},async prompt(){return GU1},renderResultForAssistant(I){return I},renderToolUseMessage({path:I,ignore:G},{verbose:Z}){let d=I?sM2(I)?I:eM2(u0(),I):void 0,W=d?q11(u0(),d):".",B=`path: "${Z?I:W}"`;if(G&&G.length>0)B+=`, ignore: ${G.join(", ")}`;return B},renderToolUseRejectedMessage(){return WZ.createElement(E5,null)},renderToolResultMessage(I,{verbose:G}){if(typeof I!=="string")return null;let Z=I.replace(VU1,"");if(!Z)return null;return WZ.createEleme
```

##### Snippet 4

```javascript
: Installs package dependencies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`});return(G.message.content[0]?.type==="text"?G.message.content[0].text:null)||"Executes a bash command"}catch(G){return W0(G),"Executes a bash command"}},async prompt(){return Z$2},isReadOnly({command:I}){return wN(I).every((G)=>{for(let Z of nq3)if(Z.test(G))return!0;return!1})},inputSchema:wT,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let G=wN(I);for(let Z of G){let d=Z.split(" "),W=d[0];if(W&&CU1.includes(W.toLowerCase()))return{result:!1,message:`Command '${W}' is not allowed for security reasons`};if(W==="cd"&&d[1]){let B=d[1].replace(/^['"]|['"]$/g,""),w=d$2(B)?B:B$2(u0(),B);if(!yW1(W$2(r8(),w),W$2(u0(),r8())))return{result:!1,message:`ERROR: cd to '${w}' was blocked. For security, ${b2} may only change directories to child directories of the original working d
```

##### Snippet 5

```javascript
_path:e.string().describe("The absolute path to the file to write (must be absolute, not relative)"),content:e.string().describe("The content to write to the file")}),y7={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return M$2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:EU1(u0(),I.file_path)}`},inputSchema:xg3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!QE(y7.getPath(I),G)},renderToolUseRejectedMessage({file_path:I,content:G},{columns:Z,verbose:d}){try{let W=vU1(I)?I:MU1(u0(),I),B=RU1(W),w=B?pG(W):"utf-8",V=B?$$2(W,w):null,C=V?"update":"create",X=G_({filePath:I,fileContents:V??"",oldStr:V??"",newStr:G});return m9.createElement(p,{flexDirection:"column"},m9.createElement(O,null,"  ","⎿"," ",m9.createElement(O,{color:e1().error},"User rejected ",C==="update"?"update":"write"," to"," "),m9
```

##### Snippet 6

```javascript
scribe("The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required."),edit_mode:e.string().optional().describe("The type of edit to make (replace, insert, delete). Defaults to replace.")}),HG={name:"NotebookEditCell",async description(){return T$2},async prompt(){return b$2},userFacingName(){return"Edit Notebook"},async isEnabled(){return!0},inputSchema:rg3,isReadOnly(){return!1},getPath(I){return I.notebook_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!QE(HG.getPath(I),G)},renderResultForAssistant({cell_number:I,edit_mode:G,new_source:Z,error:d}){if(d)return d;switch(G){case"replace":return`Updated cell ${I} with ${Z}`;case"insert":return`Inserted cell ${I} with ${Z}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:ag3(u0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: 
```

##### Snippet 7

```javascript
=pG(W),w=LU1(W,B);if(w.includes(Z))return I;let{result:V,appliedReplacements:C}=BU3(Z);if(w.includes(V)){let X=d;for(let{from:Y,to:A}of C)X=X.replaceAll(Y,A);return{file_path:G,old_string:V,new_string:X}}}catch(W){W0(W)}return I}var DG={name:"Edit",async description(){return"A tool for editing files"},async prompt(){return x$2},userFacingName({old_string:I}){if(I==="")return"Create";return"Update"},async isEnabled(){return!0},inputSchema:dU3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!QE(I.file_path,G)},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:c$2(u0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:G},{verbose:Z}){return J6.createElement(O11,{filePath:I,structuredPatch:G,verbose:Z})},renderToolUseRejectedMessage({file_path:I,old_string:G,new_string:Z},{columns:d,verbose:W}){try{let{patch:B}=DT(I,G,Z);return J6.createElement(p,{flexDirection:"column"},J6.createElement(O
```

##### Snippet 8

```javascript
},w=await fetch(this._endpoint,B);if(!w.ok){let V=await w.text().catch(()=>null);throw new Error(`Error POSTing to endpoint (HTTP ${w.status}): ${V}`)}}catch(W){throw(d=this.onerror)===null||d===void 0||d.call(this,W),W}}}var S5=A1(u1(),1);var _P2="",HP2="";var Xv3=e.object({}).passthrough(),DP2={async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return HP2},async prompt(){return _P2},inputSchema:Xv3,async*call(){yield{type:"result",data:"",resultForAssistant:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return S5.createElement(E5,null)},renderToolResultMessage(I,{verbose:G}){if(Array.isArray(I))return S5.createElement(p,{flexDirection:"column"},I.map((d,W)=>{if(d.type==="image")return S5.createElement(p,{key:W,justifyContent:"space-between",overflowX:"hidden",width:"100%"},S5.createElement(p,{flexDirection:"r
```

##### Snippet 9

```javascript
Color:!0},"Cost: $",I.toFixed(4)," (",d,"s)"))}import{isAbsolute as $v3,relative as Sv3,resolve as Lv3}from"path";var Pv3=e.strictObject({pattern:e.string().describe("The glob pattern to match files against"),path:e.string().optional().describe("The directory to search in. Defaults to the current working directory.")}),W7={name:K11,async description(){return tg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:Pv3,isReadOnly(){return!0},getPath({path:I}){return I||u0()},needsPermissions(I){return!PX(W7.getPath(I))},async prompt(){return tg1},renderToolUseMessage({pattern:I,path:G},{verbose:Z}){let d=G?$v3(G)?G:Lv3(u0(),G):void 0,W=d?Sv3(u0(),d):void 0;return`pattern: "${I}"${W||Z?`, path: "${Z?d:W}"`:""}`},renderToolUseRejectedMessage(){return QJ.default.createElement(E5,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return QJ.default.createElement(p,{justifyContent:"space-between",width:"100%"},QJ.default.createElement(p,{flexDirectio
```

##### Snippet 10

```javascript
pattern:e.string().describe("The regular expression pattern to search for in file contents"),path:e.string().optional().describe("The directory to search in. Defaults to the current working directory."),include:e.string().optional().describe('File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")')}),TP2=100,CZ={name:z11,async description(){return IU1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:yv3,isReadOnly(){return!0},getPath({path:I}){return I||u0()},needsPermissions({path:I}){return!PX(I||u0())},async prompt(){return IU1},renderToolUseMessage({pattern:I,path:G,include:Z},{verbose:d}){let{absolutePath:W,relativePath:B}=cd0(G);return`pattern: "${I}"${B||d?`, path: "${d?W:B}"`:""}${Z?`, include: "${Z}"`:""}`},renderToolUseRejectedMessage(){return NJ.default.createElement(E5,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return NJ.default.createElement(p,{justifyContent:"space-between",width:"100%"},NJ.default.createElement(p,{fle
```

##### Snippet 11

```javascript
;if("text"in B)return B.text}return"No response from model"}var vL3=e.strictObject({url:e.string().url().describe("The URL to fetch content from"),prompt:e.string().describe("The prompt to run on the fetched content")}),OB={name:zu2,async description(I){let{url:G}=I;try{return`Claude wants to fetch content from ${new URL(G).hostname}`}catch{return"Claude wants to fetch content from this URL"}},userFacingName(){return"Web Fetch"},async isEnabled(){return!1},inputSchema:vL3,isReadOnly(){return!0},needsPermissions(I){return!0},async prompt(){return Qu2},renderToolUseMessage({url:I,prompt:G},{verbose:Z}){return`url: "${I}"${Z?`, prompt: "${G}"`:""}`},renderToolUseRejectedMessage(){return Jb.default.createElement(E5,null)},renderToolResultMessage(I){return Jb.default.createElement(p,{justifyContent:"space-between",width:"100%"},Jb.default.createElement(Bd,null,Jb.default.createElement(O,{bold:!0},I.url)))},async*call(I,{abortController:G}){let Z=Date.now(),{url:d,prompt:W}=I;try{let B=await
```

##### Snippet 12

```javascript
uested permissions to use ${j4.name}, but you haven't granted it yet.`};if(W.every((w)=>{let V=B.subcommandPrefixes.get(w);if(V===void 0||V.commandInjectionDetected)return!1;return cm2(w,V?V.commandPrefix:null,Z)}))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${j4.name}, but you haven't granted it yet.`}},EJ=async(I,G,Z,d,W)=>{if(Z.options.permissionMode==="dangerouslySkipPermissions")return{result:!0};if(Z.abortController.signal.aborted)throw new NC;try{if(!I.needsPermissions(G,{writeFileAllowedDirectories:W}))return{result:!0}}catch(V){return W0(`Error checking permissions: ${V}`),{result:!1,message:"Error checking permissions"}}let w=[...E4().allowedTools,...Z.options.allowedToolsFromCLIFlag];if(I===j4&&w.includes(j4.name))return{result:!0};switch(I){case j4:{let{command:V}=wT.parse(G);return await EL3(V,Z,w)}case DG:case y7:case HG:{if(w.includes(AM(I,G,null)))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name
```

##### Snippet 13

```javascript
age.usage.input_tokens+m.message.usage.output_tokens)+" tokens",jv(Date.now()-A)];yield{type:"progress",content:K6({content:`Done (${V1.join(" · ")})`,surface:"both"}),normalizedMessages:P,tools:D,parentMessageID:X.message.id,toolUseID:K,isResolved:!0}}let j=m.message.content.filter((V1)=>V1.type==="text");yield{type:"result",data:j,normalizedMessages:P,resultForAssistant:this.renderResultForAssistant(j),tools:D}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:G}){let Z=I.split(Ou3);return aE(!G&&Z.length>1?Z[0]+"…":I)},renderToolUseRejectedMessage(){return IE1.createElement(E5,null)}};var lN=A1(u1(),1);var Cb2=`You are an expert software architect. Your role is to analyze technical requirements and produce clear, actionable implementation plans.
These plans will then be carried out by a junior software engineer so you need to be specific and de
```

##### Snippet 14

```javascript
 whenever you need help planning how to implement a feature, solve a technical problem, or structure your code.";var Tu3=[j4,fI,_G,y7,W7,CZ],bu3=e.strictObject({prompt:e.string().describe("The technical request or coding task to analyze"),context:e.string().describe("Optional context from previous conversation or system state").optional()}),Xb2={name:"Architect",async description(){return GE1},inputSchema:bu3,isReadOnly(){return!0},userFacingName(){return"Architect"},async isEnabled(){return!1},needsPermissions(){return!1},async*call({prompt:I,context:G},Z,d,W,B){let w=G?`<context>${G}</context>

${I}`:I,V=(Z.options.tools??[]).filter((D)=>Tu3.map((J)=>J.name).includes(D.name)),X=[h9({content:w,surface:"both"})],Y=await Z_(TX(X,[Cb2],await FG(),d,{...Z,options:{...Z.options,tools:V}},B));if(Y.type!=="assistant")throw new Error("Invalid response from Claude API");let A=Y.message.content.filter((D)=>D.type==="text");yield{type:"result",data:A,resultForAssistant:this.renderResultForAssist
```

##### Snippet 15

```javascript
sReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!PX(YV.getPath(I))},async validateInput({notebook_path:I}){let G=_v2(I)?I:Hv2(u0(),I);if(!VK3(G)){let Z=nf(G),d="File does not exist.";if(Z)d+=` Did you mean ${Z}?`;return{result:!1,message:d}}if(XK3(G)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:YK3(u0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return sA.createElement(E5,null)},renderToolResultMessage(I){if(!I)return sA.createElement(O,null,"No cells found in notebook");if(I.length<1||!I[0])return sA.createElement(O,null,"No cells found in notebook");return sA.createElement(O,null,"Read ",I.length," cells")},async*call({notebook_path:I}){let G=_v2(I)?I:Hv2(u0(),I),Z=CK3(G,"utf-8"),d=JSON.parse(Z),W=d.metadata.language_info?.name??"python",B=d.cells.map((w,V)=>DK3(w,V,W));yield{type:"result",resultForAssis
```

##### Snippet 16

```javascript
e")));case"text":{let{filePath:Z,content:d,numLines:W}=I.file,B=d||"(No content)";return D6.createElement(p,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},D6.createElement(p,{flexDirection:"row"},D6.createElement(O,null,"  ⎿  "),D6.createElement(p,{flexDirection:"column"},D6.createElement(SX,{code:G?B:B.split(`
`).slice(0,ag1).filter((w)=>w.trim()!=="").join(`
`),language:Fq3(Z).slice(1)}),!G&&W>ag1&&D6.createElement(O,{color:e1().secondaryText},"... (+",W-ag1," lines)"))))}}},renderToolUseRejectedMessage(){return D6.createElement(E5,null)},async validateInput({file_path:I,offset:G,limit:Z}){let d=OW1(I);if(gD(d))return{result:!1,message:"File is in a directory that is ignored by your project configuration."};if(!Dq3(d)){let V=nf(d),C="File does not exist.";if(V)C+=` Did you mean ${V}?`;return{result:!1,message:C}}let B=bM2(d).size,w=og1.extname(d).toLowerCase();if(!rg1.has(w)){if(B>eg1&&!G&&!Z)return{result:!1,message:TM2(B),meta:{fileSize:B}}}return{result:!0}},asyn
```

##### Snippet 17

```javascript
f glob patterns to ignore")}),fI={name:"LS",async description(){return GU1},userFacingName(){return"List"},async isEnabled(){return!0},inputSchema:kq3,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!PX(fI.getPath(I))},async prompt(){return GU1},renderResultForAssistant(I){return I},renderToolUseMessage({path:I,ignore:G},{verbose:Z}){let d=I?sM2(I)?I:eM2(u0(),I):void 0,W=d?q11(u0(),d):".",B=`path: "${Z?I:W}"`;if(G&&G.length>0)B+=`, ignore: ${G.join(", ")}`;return B},renderToolUseRejectedMessage(){return WZ.createElement(E5,null)},renderToolResultMessage(I,{verbose:G}){if(typeof I!=="string")return null;let Z=I.replace(VU1,"");if(!Z)return null;return WZ.createElement(p,{justifyContent:"space-between",width:"100%"},WZ.createElement(p,null,WZ.createElement(O,null,"  ⎿  "),WZ.createElement(p,{flexDirection:"column",paddingLeft:0},Z.split(`
`).filter((d)=>d.trim()!=="").slice(0,G?void 0:wU1).map((d,W)=>WZ.createElement(O,{key:W},d)),!G&&Z.split(`
`).length>wU1&
```

##### Snippet 18

```javascript
u0(),B);if(!yW1(W$2(r8(),w),W$2(u0(),r8())))return{result:!1,message:`ERROR: cd to '${w}' was blocked. For security, ${b2} may only change directories to child directories of the original working directory (${r8()}) for this session.`}}}return{result:!0}},renderToolUseMessage({command:I}){if(I.includes(`"$(cat <<'EOF'`)){let G=I.match(/^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/);if(G&&G[1]&&G[2]){let Z=G[1],d=G[2],W=G[3]||"";return`${Z.trim()} "${d.trim()}"${W.trim()}`}}return I},renderToolUseRejectedMessage(){return BT.createElement(E5,null)},renderToolResultMessage(I,{verbose:G}){return BT.createElement(g11,{content:I,verbose:G})},renderResultForAssistant({interrupted:I,stdout:G,stderr:Z,isImage:d}){if(d){let w=G.trim().match(/^data:([^;]+);base64,(.+)$/);if(w){let V=w[1],C=w[2];return[{type:"image",source:{type:"base64",media_type:V||"image/jpeg",data:C||""}}]}return G.trim()}let W=Z.trim();if(I){if(Z)W+=U11;W+="<error>Command was aborted before completion</error>"}le
```

##### Snippet 19

```javascript
ute, not relative)"),content:e.string().describe("The content to write to the file")}),y7={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return M$2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:EU1(u0(),I.file_path)}`},inputSchema:xg3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!QE(y7.getPath(I),G)},renderToolUseRejectedMessage({file_path:I,content:G},{columns:Z,verbose:d}){try{let W=vU1(I)?I:MU1(u0(),I),B=RU1(W),w=B?pG(W):"utf-8",V=B?$$2(W,w):null,C=V?"update":"create",X=G_({filePath:I,fileContents:V??"",oldStr:V??"",newStr:G});return m9.createElement(p,{flexDirection:"column"},m9.createElement(O,null,"  ","⎿"," ",m9.createElement(O,{color:e1().error},"User rejected ",C==="update"?"update":"write"," to"," "),m9.createElement(O,{bold:!0},d?I:EU1(u0(),I))),vB(X.map((Y)=>m9.createElement(p,{f
```

##### Snippet 20

```javascript
urn!QE(HG.getPath(I),G)},renderResultForAssistant({cell_number:I,edit_mode:G,new_source:Z,error:d}){if(d)return d;switch(G){case"replace":return`Updated cell ${I} with ${Z}`;case"insert":return`Inserted cell ${I} with ${Z}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:ag3(u0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I.edit_mode??"replace"}`},renderToolUseRejectedMessage(){return BZ.createElement(E5,null)},renderToolResultMessage({cell_number:I,new_source:G,language:Z,error:d}){if(d)return BZ.createElement(p,{flexDirection:"column"},BZ.createElement(O,{color:"red"},d));return BZ.createElement(p,{flexDirection:"column"},BZ.createElement(O,null,"Updated cell ",I,":"),BZ.createElement(p,{marginLeft:2},BZ.createElement(SX,{code:G,language:Z})))},async validateInput({notebook_path:I,cell_number:G,cell_type:Z,edit_mode:d="replace"}){let W=
```

##### Snippet 21

```javascript
mpt(){return x$2},userFacingName({old_string:I}){if(I==="")return"Create";return"Update"},async isEnabled(){return!0},inputSchema:dU3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!QE(I.file_path,G)},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:c$2(u0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:G},{verbose:Z}){return J6.createElement(O11,{filePath:I,structuredPatch:G,verbose:Z})},renderToolUseRejectedMessage({file_path:I,old_string:G,new_string:Z},{columns:d,verbose:W}){try{let{patch:B}=DT(I,G,Z);return J6.createElement(p,{flexDirection:"column"},J6.createElement(O,null,"  ","⎿"," ",J6.createElement(O,{color:e1().error},"User rejected ",G===""?"write":"update"," to"," "),J6.createElement(O,{bold:!0},W?I:c$2(u0(),I))),vB(B.map((w)=>J6.createElement(p,{flexDirection:"column",paddingLeft:5,key:w.newStart},J6.createElement(EB,{patch:w,dim:!0,width:d-12}))),(w)=>J6.createElem
```

##### Snippet 22

```javascript
W){throw(d=this.onerror)===null||d===void 0||d.call(this,W),W}}}var S5=A1(u1(),1);var _P2="",HP2="";var Xv3=e.object({}).passthrough(),DP2={async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return HP2},async prompt(){return _P2},inputSchema:Xv3,async*call(){yield{type:"result",data:"",resultForAssistant:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return S5.createElement(E5,null)},renderToolResultMessage(I,{verbose:G}){if(Array.isArray(I))return S5.createElement(p,{flexDirection:"column"},I.map((d,W)=>{if(d.type==="image")return S5.createElement(p,{key:W,justifyContent:"space-between",overflowX:"hidden",width:"100%"},S5.createElement(p,{flexDirection:"row"},S5.createElement(O,null,"  ⎿  "),S5.createElement(O,null,"[Image]")));let B=d.text.split(`
`).length;return S5.createElement($E,{key:W,content:d.text,lin
```

##### Snippet 23

```javascript
ibe("The directory to search in. Defaults to the current working directory.")}),W7={name:K11,async description(){return tg1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:Pv3,isReadOnly(){return!0},getPath({path:I}){return I||u0()},needsPermissions(I){return!PX(W7.getPath(I))},async prompt(){return tg1},renderToolUseMessage({pattern:I,path:G},{verbose:Z}){let d=G?$v3(G)?G:Lv3(u0(),G):void 0,W=d?Sv3(u0(),d):void 0;return`pattern: "${I}"${W||Z?`, path: "${Z?d:W}"`:""}`},renderToolUseRejectedMessage(){return QJ.default.createElement(E5,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return QJ.default.createElement(p,{justifyContent:"space-between",width:"100%"},QJ.default.createElement(p,{flexDirection:"row"},QJ.default.createElement(O,null,"  ⎿  Found "),QJ.default.createElement(O,{bold:!0},I.numFiles," "),QJ.default.createElement(O,null,I.numFiles===0||I.numFiles>1?"files":"file")),QJ.default.createElement(zJ,{costUSD:0,durationMs:I.du
```

##### Snippet 24

```javascript
lude in the search (e.g. "*.js", "*.{ts,tsx}")')}),TP2=100,CZ={name:z11,async description(){return IU1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:yv3,isReadOnly(){return!0},getPath({path:I}){return I||u0()},needsPermissions({path:I}){return!PX(I||u0())},async prompt(){return IU1},renderToolUseMessage({pattern:I,path:G,include:Z},{verbose:d}){let{absolutePath:W,relativePath:B}=cd0(G);return`pattern: "${I}"${B||d?`, path: "${d?W:B}"`:""}${Z?`, include: "${Z}"`:""}`},renderToolUseRejectedMessage(){return NJ.default.createElement(E5,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return NJ.default.createElement(p,{justifyContent:"space-between",width:"100%"},NJ.default.createElement(p,{flexDirection:"row"},NJ.default.createElement(O,null,"  ⎿  Found "),NJ.default.createElement(O,{bold:!0},I.numFiles," "),NJ.default.createElement(O,null,I.numFiles===0||I.numFiles>1?"files":"file")),NJ.default.createElement(zJ,{costUSD:0,durationMs:I.durationMs,deb
```

##### Snippet 25

```javascript
turn Z}function S01(I,G,Z){return bP2.useMemo(()=>{let d=Ov3(I,Z);if(!d)throw new ReferenceError(`Tool use not found for tool_use_id ${I}`);let W=[...G,W7,CZ].find((B)=>B.name===d.name);if(W===W7||W===CZ)B0("tengu_legacy_tool_lookup",{});if(!W)throw new ReferenceError(`Tool not found for ${d.name}`);return{tool:W,toolUse:d}},[I,Z,G])}function jP2({toolUseID:I,tools:G,messages:Z,verbose:d}){let{columns:W}=Q5(),{tool:B,toolUse:w}=S01(I,G,Z),V=B.inputSchema.safeParse(w.input);if(V.success)return B.renderToolUseRejectedMessage(V.data,{columns:W,verbose:d});return xf1.createElement(E5,null)}var hf1=A1(u1(),1);function lP2({param:I,message:G,messages:Z,tools:d,verbose:W,width:B}){let{tool:w}=S01(I.tool_use_id,d,Z);if(!G.toolUseResult)return null;return hf1.createElement(p,{flexDirection:"column",width:B},w.renderToolResultMessage?.(G.toolUseResult.data,{verbose:W}))}function kP2({param:I,message:G,messages:Z,tools:d,verbose:W,width:B}){if(I.content===pE)return V_.createElement(OP2,null);if(I
```

##### Snippet 26

```javascript
.string().describe("The prompt to run on the fetched content")}),OB={name:zu2,async description(I){let{url:G}=I;try{return`Claude wants to fetch content from ${new URL(G).hostname}`}catch{return"Claude wants to fetch content from this URL"}},userFacingName(){return"Web Fetch"},async isEnabled(){return!1},inputSchema:vL3,isReadOnly(){return!0},needsPermissions(I){return!0},async prompt(){return Qu2},renderToolUseMessage({url:I,prompt:G},{verbose:Z}){return`url: "${I}"${Z?`, prompt: "${G}"`:""}`},renderToolUseRejectedMessage(){return Jb.default.createElement(E5,null)},renderToolResultMessage(I){return Jb.default.createElement(p,{justifyContent:"space-between",width:"100%"},Jb.default.createElement(Bd,null,Jb.default.createElement(O,{bold:!0},I.url)))},async*call(I,{abortController:G}){let Z=Date.now(),{url:d,prompt:W}=I;try{let B=await xm2(d,G),V={result:await hm2(W,B),durationMs:Date.now()-Z,url:d};yield{type:"result",resultForAssistant:this.renderResultForAssistant(V),data:V}}catch(B){
```

##### Snippet 27

```javascript
ormalizedMessages:P,tools:D,parentMessageID:X.message.id,toolUseID:K,isResolved:!0}}let j=m.message.content.filter((V1)=>V1.type==="text");yield{type:"result",data:j,normalizedMessages:P,resultForAssistant:this.renderResultForAssistant(j),tools:D}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:G}){let Z=I.split(Ou3);return aE(!G&&Z.length>1?Z[0]+"…":I)},renderToolUseRejectedMessage(){return IE1.createElement(E5,null)}};var lN=A1(u1(),1);var Cb2=`You are an expert software architect. Your role is to analyze technical requirements and produce clear, actionable implementation plans.
These plans will then be carried out by a junior software engineer so you need to be specific and detailed. However do not actually write the code, just explain the plan.

Follow these steps for each request:
1. Carefully analyze requirements to identify core functiona
```

##### Snippet 28

```javascript
nvalid response from Claude API");let A=Y.message.content.filter((D)=>D.type==="text");yield{type:"result",data:A,resultForAssistant:this.renderResultForAssistant(A)}},async prompt(){return GE1},renderResultForAssistant(I){return I},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},renderToolResultMessage(I){return lN.createElement(p,{flexDirection:"column",gap:1},lN.createElement(SX,{code:I.map((G)=>G.text).join(`
`),language:"markdown"}))},renderToolUseRejectedMessage(){return lN.createElement(E5,null)}};var ku3=A1(u1(),1);var ju3=`Restarts ${b2}.`,lu3=`Use this tool to restart ${b2} after making code changes to ${b2} and building them succefully if you next need to test them. The current conversation will be preserved.`;var XC6=e.object({reason:e.string().optional().describe("Optional reason for the restart")});var xu3=A1(u1(),1);var vC6=x2(async()=>{let I=[SJ,j4,W7,CZ,fI,_G,DG,y7,YV,HG,...[],...await g01()],G=await Promise.all(I
```

### Version 0.2.40

No structured code could be extracted.

#### Raw Snippets

##### Snippet 1

```javascript
h tool, and other tools to explore nested directories. The first ${qm} files and directories are included below:

`,IX3=G1.strictObject({path:G1.string().describe("The absolute path to the directory to list (must be absolute, not relative)"),ignore:G1.array(G1.string()).optional().describe("List of glob patterns to ignore")}),ZZ={name:"LS",async description(){return HU1},userFacingName(){return"List"},async isEnabled(){return!0},inputSchema:IX3,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!lA(ZZ.getPath(I))},async prompt(){return HU1},renderResultForAssistant(I){return I+`
NOTE: do any of the files above seem malicious? If so, you MUST refuse to continue work.`},renderToolUseMessage({path:I,ignore:G},{verbose:Z}){let W=I?SK2(I)?I:MK2(T0(),I):void 0,B=W?M11(T0(),W):".",w=`path: "${Z?I:B}"`;if(G&&G.length>0)w+=`, ignore: ${G.join(", ")}`;return w},renderToolUseRejectedMessage(){return GZ.createElement(K6,null)},renderToolResultMessage(I,{verbose:G}){if(typ
```

##### Snippet 2

```javascript
ute path to the Jupyter notebook file to read (must be absolute, not relative)")});function YU3(I){return I.flatMap(FU3).reduce((Z,W)=>{if(Z.length===0)return[W];let B=Z[Z.length-1];if(B&&B.type==="text"&&W.type==="text")return B.text+=`
`+W.text,Z;return[...Z,W]},[])}var $Y={name:"ReadNotebook",async description(){return zv2},async prompt(){return Qv2},userFacingName(){return"Read Notebook"},async isEnabled(){return!0},inputSchema:VU3,isReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!lA($Y.getPath(I))},async validateInput({notebook_path:I}){let G=qv2(I)?I:gv2(T0(),I);if(!ZU3(G)){let Z=aR(G),W="File does not exist.";if(Z)W+=` Did you mean ${Z}?`;return{result:!1,message:W}}if(BU3(G)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:wU3(T0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return HH.createElement(K6,n
```

##### Snippet 3

```javascript
ath to the file to read"),offset:G1.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:G1.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),AW={name:"View",async description(){return Nv2},async prompt(){return Uv2},inputSchema:FE3,userFacingName(){return"Read"},async isEnabled(){return!0},isReadOnly(){return!0},getPath({file_path:I}){return I||T0()},needsPermissions(I){return!lA(AW.getPath(I))},renderToolUseMessage(I,{verbose:G}){let{file_path:Z,...W}=I;return[["file_path",G?Z:HE3(T0(),Z)],...Object.entries(W)].map(([w,V])=>`${w}: ${JSON.stringify(V)}`).join(", ")},renderToolResultMessage(I,{verbose:G}){switch(I.type){case"image":return z6.createElement(l,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},z6.createElement(l,{flexDirection:"row"},z6.createElement(b,null,"  ⎿  "),z6.createElement(b,null,"Read image")));case"text
```

##### Snippet 4

```javascript
cribe("The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required."),edit_mode:G1.string().optional().describe("The type of edit to make (replace, insert, delete). Defaults to replace.")}),JG={name:"NotebookEditCell",async description(){return sP2},async prompt(){return oP2},userFacingName(){return"Edit Notebook"},async isEnabled(){return!0},inputSchema:RE3,isReadOnly(){return!1},getPath(I){return I.notebook_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!uE(JG.getPath(I),G)},renderResultForAssistant({cell_number:I,edit_mode:G,new_source:Z,error:W}){if(W)return W;switch(G){case"replace":return`Updated cell ${I} with ${Z}`;case"insert":return`Inserted cell ${I} with ${Z}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:UE3(T0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: 
```

##### Snippet 5

```javascript
aceAll(`\r
`,`
`);if(w.includes(Z))return I;let{result:V,appliedReplacements:Y}=LE3(Z);if(w.includes(V)){let C=W;for(let{from:A,to:X}of Y)C=C.replaceAll(A,X);return{file_path:G,old_string:V,new_string:C}}}catch(B){Z0(B)}return I}var UI={name:"Edit",async description(){return"A tool for editing files"},async prompt(){return GL2},userFacingName({old_string:I}){if(I==="")return"Create";return"Update"},async isEnabled(){return!0},inputSchema:ME3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!uE(I.file_path,G)},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:WL2(T0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:G},{verbose:Z}){return Q6.createElement(o01,{filePath:I,structuredPatch:G,verbose:Z})},renderToolUseRejectedMessage({file_path:I,old_string:G,new_string:Z},{columns:W,verbose:B}){try{let{patch:w}=Bb(I,G,Z);return Q6.createElement(l,{flexDirection:"column"},Q6.createElement(b
```

##### Snippet 6

```javascript
ath:G1.string().describe("The absolute path to the file to write (must be absolute, not relative)"),content:G1.string().describe("The content to write to the file")}),RI={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return YL2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:Nf1(T0(),I.file_path)}`},inputSchema:kE3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!uE(RI.getPath(I),G)},renderToolUseRejectedMessage({file_path:I,content:G},{columns:Z,verbose:W}){try{let B=gf1(I)?I:Uf1(T0(),I),w=qf1(B),V=w?oW(B):"utf-8",Y=w?CL2(B,V):null,C=Y?"update":"create",A=sA({filePath:I,fileContents:Y??"",oldStr:Y??"",newStr:G});return T9.createElement(l,{flexDirection:"column"},T9.createElement(b,null,"  ","⎿"," ",T9.createElement(b,{color:o1().error},"User rejected ",C==="update"?"update":"write"," to"," "),T9
```

##### Snippet 7

```javascript
verflow:"hidden"},$b.createElement(b,null,"  ","⎿  "),I)}var pP3=G1.strictObject({url:G1.string().url().describe("The URL to fetch content from"),prompt:G1.string().describe("The prompt to run on the fetched content")}),sw={name:_L2,async description(I){let{url:G}=I;try{return`Claude wants to fetch content from ${new URL(G).hostname}`}catch{return"Claude wants to fetch content from this URL"}},userFacingName(){return"Web Fetch"},async isEnabled(){return!1},inputSchema:pP3,isReadOnly(){return!0},needsPermissions(I){return!0},async prompt(){return HL2},async validateInput(I,G){let{url:Z}=I;if(!G.userProvidedUrls.has(Z))return{result:!1,message:`Error: URL "${Z}" was not provided by the user. For security, you can only fetch URLs that were explicitly shared by the user in their messages.`,meta:{reason:"url_not_provided_by_user"}};return{result:!0}},renderToolUseMessage({url:I,prompt:G},{verbose:Z}){return`url: "${I}"${Z?`, prompt: "${G}"`:""}`},renderToolUseRejectedMessage(){return Eb.def
```

##### Snippet 8

```javascript
e:"result",data:{result:await mu2(B,V),durationMs:Date.now()-Z,url:W}}}catch(V){Z0(V),yield{type:"result",data:{result:`Error: ${V instanceof Error?V.message:"Unknown error"}`,durationMs:Date.now()-Z,url:W}}}},renderResultForAssistant(I){return I.result}};function iP3(I){return[...d4().allowedTools,...I.options.allowedToolsFromCLIFlag]}var kd=async(I,G,Z,W,B)=>{if(Z.options.permissionMode==="dangerouslySkipPermissions")return{result:!0};if(Z.abortController.signal.aborted)throw new lW;try{if(!I.needsPermissions(G,{writeFileAllowedDirectories:B}))return{result:!0}}catch(V){return Z0(V),{result:!1,message:"Error checking permissions"}}let w=iP3(Z);if(I===k4&&w.includes(k4.name))return{result:!0};switch(I){case k4:{let{command:V}=Sb.parse(G);return await ku2(V,Z,w)}case UI:case RI:case JG:{if(w.includes(Gg(I,G,null)))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}default:{let V=Gg(I,G,null);if(w.includes(V))retu
```

##### Snippet 9

```javascript
: Installs package dependencies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`});return(G.message.content[0]?.type==="text"?G.message.content[0].text:null)||"Executes a bash command"}catch(G){return Z0(G),"Executes a bash command"}},async prompt(){return aP2},isReadOnly({command:I}){return Nd(I).every((G)=>{for(let Z of tP3)if(Z.test(G))return!0;return!1})},inputSchema:Sb,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let[G,Z]=lu2(I);if(G&&Z)return{result:!1,message:`Command '${Z}' is not allowed`};let W=hu2(I);if(!W.result)return W;return{result:!0}},renderToolUseMessage({command:I}){if(I.includes(`"$(cat <<'EOF'`)){let G=I.match(/^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/);if(G&&G[1]&&G[2]){let Z=G[1],W=G[2],B=G[3]||"";return`${Z.trim()} "${W.trim()}"${B.trim()}`}}return I},renderToolUseRejectedMessage(){return vb.createElement(K6,
```

##### Snippet 10

```javascript
d 0:Z.signal},V=await fetch(this._endpoint,w);if(!V.ok){let Y=await V.text().catch(()=>null);throw new Error(`Error POSTing to endpoint (HTTP ${V.status}): ${Y}`)}}catch(B){throw(W=this.onerror)===null||W===void 0||W.call(this,B),B}}}var P5=F1(y1(),1);var Lj2="",yj2="";var Bu3=G1.object({}).passthrough(),Oj2={isMcp:!0,async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return yj2},async prompt(){return Lj2},inputSchema:Bu3,async*call(){yield{type:"result",data:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return P5.createElement(K6,null)},renderToolResultMessage(I,{verbose:G}){if(Array.isArray(I))return P5.createElement(l,{flexDirection:"column"},I.map((W,B)=>{if(W.type==="image")return P5.createElement(l,{key:B,justifyContent:"space-between",overflowX:"hidden",width:"100%"},P5.createElement(l,{flexDirection:"r
```

##### Snippet 11

```javascript
or:!0},"Cost: $",I.toFixed(4)," (",W,"s)"))}import{isAbsolute as qT3,relative as gT3,resolve as NT3}from"path";var UT3=G1.strictObject({pattern:G1.string().describe("The glob pattern to match files against"),path:G1.string().optional().describe("The directory to search in. Defaults to the current working directory.")}),vI={name:n01,async description(){return df1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:UT3,isReadOnly(){return!0},getPath({path:I}){return I||T0()},needsPermissions(I){return!lA(vI.getPath(I))},async prompt(){return df1},renderToolUseMessage({pattern:I,path:G},{verbose:Z}){let W=G?qT3(G)?G:NT3(T0(),G):void 0,B=W?gT3(T0(),W):void 0;return`pattern: "${I}"${B||Z?`, path: "${Z?W:B}"`:""}`},renderToolUseRejectedMessage(){return rd.default.createElement(K6,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return rd.default.createElement(l,{justifyContent:"space-between",width:"100%"},rd.default.createElement(l,{flexDirectio
```

##### Snippet 12

```javascript
tern:G1.string().describe("The regular expression pattern to search for in file contents"),path:G1.string().optional().describe("The directory to search in. Defaults to the current working directory."),include:G1.string().optional().describe('File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")')}),yk2=100,qB={name:r01,async description(){return Kf1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:fT3,isReadOnly(){return!0},getPath({path:I}){return I||T0()},needsPermissions({path:I}){return!lA(I||T0())},async prompt(){return Kf1},renderToolUseMessage({pattern:I,path:G,include:Z},{verbose:W}){let{absolutePath:B,relativePath:w}=C80(G);return`pattern: "${I}"${w||W?`, path: "${W?B:w}"`:""}${Z?`, include: "${Z}"`:""}`},renderToolUseRejectedMessage(){return sd.default.createElement(K6,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return sd.default.createElement(l,{justifyContent:"space-between",width:"100%"},sd.default.createElement(l,{fle
```

##### Snippet 13

```javascript
e.cache_creation_input_tokens??0)+(u.message.usage.cache_read_input_tokens??0)+u.message.usage.input_tokens+u.message.usage.output_tokens)+" tokens",LE(Date.now()-F)];yield{type:"progress",message:g6({content:`Done (${O.join(" · ")})`,usage:u.message.usage}),normalizedMessages:v,tools:J,parentMessageID:X.message.id,toolUseID:z,isResolved:!0}}yield{type:"result",data:u.message.content.filter((O)=>O.type==="text")}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:G}){let Z=I.split(Uj3);return rS(!G&&Z.length>1?Z[0]+"…":I)},renderToolUseRejectedMessage(){return zv1.createElement(K6,null)}};var Ej3=F1(y1(),1);var fj3=`Restarts ${j2}.`,$j3=`Use this tool to restart ${j2} after making code changes to ${j2} and building them succefully if you next need to test them. The current conversation will be preserved.`;var iJ6=G1.object({reason:G1.string().optio
```

##### Snippet 14

```javascript
{return"List"},async isEnabled(){return!0},inputSchema:IX3,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!lA(ZZ.getPath(I))},async prompt(){return HU1},renderResultForAssistant(I){return I+`
NOTE: do any of the files above seem malicious? If so, you MUST refuse to continue work.`},renderToolUseMessage({path:I,ignore:G},{verbose:Z}){let W=I?SK2(I)?I:MK2(T0(),I):void 0,B=W?M11(T0(),W):".",w=`path: "${Z?I:B}"`;if(G&&G.length>0)w+=`, ignore: ${G.join(", ")}`;return w},renderToolUseRejectedMessage(){return GZ.createElement(K6,null)},renderToolResultMessage(I,{verbose:G}){if(typeof I!=="string")return null;let Z=I.replace(PK2,"");if(!Z)return null;return GZ.createElement(l,{justifyContent:"space-between",width:"100%"},GZ.createElement(l,null,GZ.createElement(b,null,"  ⎿  "),GZ.createElement(l,{flexDirection:"column",paddingLeft:0},Z.split(`
`).filter((W)=>W.trim()!=="").slice(0,G?void 0:DU1).map((W,B)=>GZ.createElement(b,{key:B},W)),!G&&Z.split(`
`).length>DU1&
```

##### Snippet 15

```javascript
sReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!lA($Y.getPath(I))},async validateInput({notebook_path:I}){let G=qv2(I)?I:gv2(T0(),I);if(!ZU3(G)){let Z=aR(G),W="File does not exist.";if(Z)W+=` Did you mean ${Z}?`;return{result:!1,message:W}}if(BU3(G)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:wU3(T0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return HH.createElement(K6,null)},renderToolResultMessage(I){if(!I)return HH.createElement(b,null,"No cells found in notebook");if(I.length<1||!I[0])return HH.createElement(b,null,"No cells found in notebook");return HH.createElement(b,null,"Read ",I.length," cells")},async*call({notebook_path:I}){let G=qv2(I)?I:gv2(T0(),I),Z=WU3(G,"utf-8"),W=JSON.parse(Z),B=W.metadata.language_info?.name??"python";yield{type:"result",data:W.cells.map((V,Y)=>XU3(V,Y,B))}},renderRes
```

##### Snippet 16

```javascript
e")));case"text":{let{filePath:Z,content:W,numLines:B}=I.file,w=W||"(No content)";return z6.createElement(l,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},z6.createElement(l,{flexDirection:"row"},z6.createElement(b,null,"  ⎿  "),z6.createElement(l,{flexDirection:"column"},z6.createElement(Md,{code:G?w:w.split(`
`).slice(0,_f1).filter((V)=>V.trim()!=="").join(`
`),language:_E3(Z).slice(1)}),!G&&B>_f1&&z6.createElement(b,{color:o1().secondaryText},"... (+",B-_f1," lines)"))))}}},renderToolUseRejectedMessage(){return z6.createElement(K6,null)},async validateInput({file_path:I,offset:G,limit:Z}){let W=mW1(I);if(rR(W))return{result:!1,message:"File is in a directory that is ignored by your project configuration."};if(!XE3(W)){let Y=aR(W),C="File does not exist.";if(Y)C+=` Did you mean ${Y}?`;return{result:!1,message:C}}let w=iP2(W).size,V=Ff1.extname(W).toLowerCase();if(!i01.has(V)){if(w>a01&&!G&&!Z)return{result:!1,message:Jf1(w),meta:{fileSize:w}}}return{result:!0}},asyn
```

##### Snippet 17

```javascript
urn!uE(JG.getPath(I),G)},renderResultForAssistant({cell_number:I,edit_mode:G,new_source:Z,error:W}){if(W)return W;switch(G){case"replace":return`Updated cell ${I} with ${Z}`;case"insert":return`Inserted cell ${I} with ${Z}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:UE3(T0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I.edit_mode??"replace"}`},renderToolUseRejectedMessage(){return CZ.createElement(K6,null)},renderToolResultMessage({cell_number:I,new_source:G,language:Z,error:W}){if(W)return CZ.createElement(l,{flexDirection:"column"},CZ.createElement(b,{color:"red"},W));return CZ.createElement(l,{flexDirection:"column"},CZ.createElement(b,null,"Updated cell ",I,":"),CZ.createElement(l,{marginLeft:2},CZ.createElement(Md,{code:G,language:Z})))},async validateInput({notebook_path:I,cell_number:G,cell_type:Z,edit_mode:W="replace"}){let B=
```

##### Snippet 18

```javascript
mpt(){return GL2},userFacingName({old_string:I}){if(I==="")return"Create";return"Update"},async isEnabled(){return!0},inputSchema:ME3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!uE(I.file_path,G)},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:WL2(T0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:G},{verbose:Z}){return Q6.createElement(o01,{filePath:I,structuredPatch:G,verbose:Z})},renderToolUseRejectedMessage({file_path:I,old_string:G,new_string:Z},{columns:W,verbose:B}){try{let{patch:w}=Bb(I,G,Z);return Q6.createElement(l,{flexDirection:"column"},Q6.createElement(b,null,"  ","⎿"," ",Q6.createElement(b,{color:o1().error},"User rejected ",G===""?"write":"update"," to"," "),Q6.createElement(b,{bold:!0},B?I:WL2(T0(),I))),aw(w.map((V)=>Q6.createElement(l,{flexDirection:"column",paddingLeft:5,key:V.newStart},Q6.createElement(wW,{patch:V,dim:!0,width:W-12}))),(V)=>Q6.createElem
```

##### Snippet 19

```javascript
te, not relative)"),content:G1.string().describe("The content to write to the file")}),RI={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return YL2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:Nf1(T0(),I.file_path)}`},inputSchema:kE3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!uE(RI.getPath(I),G)},renderToolUseRejectedMessage({file_path:I,content:G},{columns:Z,verbose:W}){try{let B=gf1(I)?I:Uf1(T0(),I),w=qf1(B),V=w?oW(B):"utf-8",Y=w?CL2(B,V):null,C=Y?"update":"create",A=sA({filePath:I,fileContents:Y??"",oldStr:Y??"",newStr:G});return T9.createElement(l,{flexDirection:"column"},T9.createElement(b,null,"  ","⎿"," ",T9.createElement(b,{color:o1().error},"User rejected ",C==="update"?"update":"write"," to"," "),T9.createElement(b,{bold:!0},W?I:Nf1(T0(),I))),aw(A.map((X)=>T9.createElement(l,{f
```

##### Snippet 20

```javascript
n!1},inputSchema:pP3,isReadOnly(){return!0},needsPermissions(I){return!0},async prompt(){return HL2},async validateInput(I,G){let{url:Z}=I;if(!G.userProvidedUrls.has(Z))return{result:!1,message:`Error: URL "${Z}" was not provided by the user. For security, you can only fetch URLs that were explicitly shared by the user in their messages.`,meta:{reason:"url_not_provided_by_user"}};return{result:!0}},renderToolUseMessage({url:I,prompt:G},{verbose:Z}){return`url: "${I}"${Z?`, prompt: "${G}"`:""}`},renderToolUseRejectedMessage(){return Eb.default.createElement(K6,null)},renderToolResultMessage(I){return Eb.default.createElement(l,{justifyContent:"space-between",width:"100%"},Eb.default.createElement(HW,null,Eb.default.createElement(b,null,I.url)))},async*call(I,G){let Z=Date.now(),{url:W,prompt:B}=I,{abortController:w}=G;if(!G.userProvidedUrls.has(W))throw new Error(`Error: URL "${W}" was not provided by the user. For security, you can only fetch URLs that were explicitly shared by the use
```

##### Snippet 21

```javascript
serFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let[G,Z]=lu2(I);if(G&&Z)return{result:!1,message:`Command '${Z}' is not allowed`};let W=hu2(I);if(!W.result)return W;return{result:!0}},renderToolUseMessage({command:I}){if(I.includes(`"$(cat <<'EOF'`)){let G=I.match(/^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/);if(G&&G[1]&&G[2]){let Z=G[1],W=G[2],B=G[3]||"";return`${Z.trim()} "${W.trim()}"${B.trim()}`}}return I},renderToolUseRejectedMessage(){return vb.createElement(K6,null)},renderToolResultMessage(I,{verbose:G}){return vb.createElement(s01,{content:I,verbose:G})},renderResultForAssistant({interrupted:I,stdout:G,stderr:Z,isImage:W}){if(W){let V=G.trim().match(/^data:([^;]+);base64,(.+)$/);if(V){let Y=V[1],C=V[2];return[{type:"image",source:{type:"base64",media_type:Y||"image/jpeg",data:C||""}}]}return G.trim()}let B=Z.trim();if(I){if(Z)B+=m21;B+="<error>Command was aborted before completion</error>"}le
```

##### Snippet 22

```javascript
Y}`)}}catch(B){throw(W=this.onerror)===null||W===void 0||W.call(this,B),B}}}var P5=F1(y1(),1);var Lj2="",yj2="";var Bu3=G1.object({}).passthrough(),Oj2={isMcp:!0,async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return yj2},async prompt(){return Lj2},inputSchema:Bu3,async*call(){yield{type:"result",data:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return P5.createElement(K6,null)},renderToolResultMessage(I,{verbose:G}){if(Array.isArray(I))return P5.createElement(l,{flexDirection:"column"},I.map((W,B)=>{if(W.type==="image")return P5.createElement(l,{key:B,justifyContent:"space-between",overflowX:"hidden",width:"100%"},P5.createElement(l,{flexDirection:"row"},P5.createElement(b,null,"  ⎿  "),P5.createElement(b,null,"[Image]")));let w=W.text.split(`
`).length;return P5.createElement(HS,{key:B,content:W.text,lin
```

##### Snippet 23

```javascript
ibe("The directory to search in. Defaults to the current working directory.")}),vI={name:n01,async description(){return df1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:UT3,isReadOnly(){return!0},getPath({path:I}){return I||T0()},needsPermissions(I){return!lA(vI.getPath(I))},async prompt(){return df1},renderToolUseMessage({pattern:I,path:G},{verbose:Z}){let W=G?qT3(G)?G:NT3(T0(),G):void 0,B=W?gT3(T0(),W):void 0;return`pattern: "${I}"${B||Z?`, path: "${Z?W:B}"`:""}`},renderToolUseRejectedMessage(){return rd.default.createElement(K6,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return rd.default.createElement(l,{justifyContent:"space-between",width:"100%"},rd.default.createElement(l,{flexDirection:"row"},rd.default.createElement(b,null,"  ⎿  Found "),rd.default.createElement(b,{bold:!0},I.numFiles," "),rd.default.createElement(b,null,I.numFiles===0||I.numFiles>1?"files":"file")),rd.default.createElement(nd,{costUSD:0,durationMs:I.du
```

##### Snippet 24

```javascript
lude in the search (e.g. "*.js", "*.{ts,tsx}")')}),yk2=100,qB={name:r01,async description(){return Kf1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:fT3,isReadOnly(){return!0},getPath({path:I}){return I||T0()},needsPermissions({path:I}){return!lA(I||T0())},async prompt(){return Kf1},renderToolUseMessage({pattern:I,path:G,include:Z},{verbose:W}){let{absolutePath:B,relativePath:w}=C80(G);return`pattern: "${I}"${w||W?`, path: "${W?B:w}"`:""}${Z?`, include: "${Z}"`:""}`},renderToolUseRejectedMessage(){return sd.default.createElement(K6,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return sd.default.createElement(l,{justifyContent:"space-between",width:"100%"},sd.default.createElement(l,{flexDirection:"row"},sd.default.createElement(b,null,"  ⎿  Found "),sd.default.createElement(b,{bold:!0},I.numFiles," "),sd.default.createElement(b,null,I.numFiles===0||I.numFiles>1?"files":"file")),sd.default.createElement(nd,{costUSD:0,durationMs:I.durationMs,deb
```

##### Snippet 25

```javascript
turn Z}function t41(I,G,Z){return Ok2.useMemo(()=>{let W=$T3(I,Z);if(!W)throw new ReferenceError(`Tool use not found for tool_use_id ${I}`);let B=[...G,vI,qB].find((w)=>w.name===W.name);if(B===vI||B===qB)G0("tengu_legacy_tool_lookup",{});if(!B)throw new ReferenceError(`Tool not found for ${W.name}`);return{tool:B,toolUse:W}},[I,Z,G])}function uk2({toolUseID:I,tools:G,messages:Z,verbose:W}){let{columns:B}=p3(),{tool:w,toolUse:V}=t41(I,G,Z),Y=w.inputSchema.safeParse(V.input);if(Y.success)return w.renderToolUseRejectedMessage(Y.data,{columns:B,verbose:W});return MS1.createElement(K6,null)}var PS1=F1(y1(),1);function Tk2({param:I,message:G,messages:Z,tools:W,verbose:B,width:w}){let{tool:V}=t41(I.tool_use_id,W,Z);if(!G.toolUseResult)return null;return PS1.createElement(l,{flexDirection:"column",width:w},V.renderToolResultMessage?.(G.toolUseResult,{verbose:B}))}function mk2({param:I,message:G,messages:Z,tools:W,verbose:B,width:w}){if(I.content===pd)return $H.createElement(Pk2,null);if(I.cont
```

##### Snippet 26

```javascript
eld{type:"progress",message:g6({content:`Done (${O.join(" · ")})`,usage:u.message.usage}),normalizedMessages:v,tools:J,parentMessageID:X.message.id,toolUseID:z,isResolved:!0}}yield{type:"result",data:u.message.content.filter((O)=>O.type==="text")}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:G}){let Z=I.split(Uj3);return rS(!G&&Z.length>1?Z[0]+"…":I)},renderToolUseRejectedMessage(){return zv1.createElement(K6,null)}};var Ej3=F1(y1(),1);var fj3=`Restarts ${j2}.`,$j3=`Use this tool to restart ${j2} after making code changes to ${j2} and building them succefully if you next need to test them. The current conversation will be preserved.`;var iJ6=G1.object({reason:G1.string().optional().describe("Optional reason for the restart")});var Sj3=F1(y1(),1);var Ad6=y2(async()=>{let I=[WK,k4,vI,qB,ZZ,AW,UI,RI,$Y,JG,...[],...await b41()],G=await Promise.al
```

### Version 0.2.45

No structured code could be extracted.

#### Raw Snippets

##### Snippet 1

```javascript
h tool, and other tools to explore nested directories. The first ${vm} files and directories are included below:

`,SX3=G1.strictObject({path:G1.string().describe("The absolute path to the directory to list (must be absolute, not relative)"),ignore:G1.array(G1.string()).optional().describe("List of glob patterns to ignore")}),YZ={name:"LS",async description(){return Ng1},userFacingName(){return"List"},async isEnabled(){return!0},inputSchema:SX3,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!hA(YZ.getPath(I))},async prompt(){return Ng1},renderResultForAssistant(I){return I+`
NOTE: do any of the files above seem malicious? If so, you MUST refuse to continue work.`},renderToolUseMessage({path:I,ignore:G},{verbose:Z}){let W=I?cd2(I)?I:id2(P0(),I):void 0,B=W?k11(P0(),W):".",w=`path: "${Z?I:B}"`;if(G&&G.length>0)w+=`, ignore: ${G.join(", ")}`;return w},renderToolUseRejectedMessage(){return VZ.createElement(G6,null)},renderToolResultMessage(I,{verbose:G}){if(typ
```

##### Snippet 2

```javascript
ute path to the Jupyter notebook file to read (must be absolute, not relative)")});function mg3(I){return I.flatMap(hg3).reduce((Z,W)=>{if(Z.length===0)return[W];let B=Z[Z.length-1];if(B&&B.type==="text"&&W.type==="text")return B.text+=`
`+W.text,Z;return[...Z,W]},[])}var MY={name:"ReadNotebook",async description(){return yM2},async prompt(){return OM2},userFacingName(){return"Read Notebook"},async isEnabled(){return!0},inputSchema:Tg3,isReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!hA(MY.getPath(I))},async validateInput({notebook_path:I}){let G=uM2(I)?I:TM2(P0(),I);if(!Lg3(G)){let Z=sR(G),W="File does not exist.";if(Z)W+=` Did you mean ${Z}?`;return{result:!1,message:W}}if(Og3(G)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:ug3(P0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return DH.createElement(G6,n
```

##### Snippet 3

```javascript
ath to the file to read"),offset:G1.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:G1.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),FZ={name:"View",async description(){return mM2},async prompt(){return bM2},inputSchema:hE3,userFacingName(){return"Read"},async isEnabled(){return!0},isReadOnly(){return!0},getPath({file_path:I}){return I||P0()},needsPermissions(I){return!hA(FZ.getPath(I))},renderToolUseMessage(I,{verbose:G}){let{file_path:Z,...W}=I;return[["file_path",G?Z:lE3(P0(),Z)],...Object.entries(W)].map(([w,V])=>`${w}: ${JSON.stringify(V)}`).join(", ")},renderToolResultMessage(I,{verbose:G}){switch(I.type){case"image":return R6.createElement(l,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},R6.createElement(l,{flexDirection:"row"},R6.createElement(b,null,"  ⎿  "),R6.createElement(b,null,"Read image")));case"text
```

##### Snippet 4

```javascript
cribe("The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required."),edit_mode:G1.string().optional().describe("The type of edit to make (replace, insert, delete). Defaults to replace.")}),QG={name:"NotebookEditCell",async description(){return _L2},async prompt(){return HL2},userFacingName(){return"Edit Notebook"},async isEnabled(){return!0},inputSchema:Iv3,isReadOnly(){return!1},getPath(I){return I.notebook_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!bE(QG.getPath(I),G)},renderResultForAssistant({cell_number:I,edit_mode:G,new_source:Z,error:W}){if(W)return W;switch(G){case"replace":return`Updated cell ${I} with ${Z}`;case"insert":return`Inserted cell ${I} with ${Z}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:tE3(P0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: 
```

##### Snippet 5

```javascript
aceAll(`\r
`,`
`);if(w.includes(Z))return I;let{result:V,appliedReplacements:Y}=Cv3(Z);if(w.includes(V)){let C=W;for(let{from:A,to:X}of Y)C=C.replaceAll(A,X);return{file_path:G,old_string:V,new_string:C}}}catch(B){Z0(B)}return I}var b7={name:"Edit",async description(){return"A tool for editing files"},async prompt(){return KL2},userFacingName({old_string:I}){if(I==="")return"Create";return"Update"},async isEnabled(){return!0},inputSchema:Vv3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!bE(I.file_path,G)},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:zL2(P0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:G},{verbose:Z}){return f6.createElement(Y21,{filePath:I,structuredPatch:G,verbose:Z})},renderToolUseRejectedMessage({file_path:I,old_string:G,new_string:Z},{columns:W,verbose:B}){try{let{patch:w}=Hb(I,G,Z);return f6.createElement(l,{flexDirection:"column"},f6.createElement(b
```

##### Snippet 6

```javascript
ath:G1.string().describe("The absolute path to the file to write (must be absolute, not relative)"),content:G1.string().describe("The content to write to the file")}),j7={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return UL2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:Pf1(P0(),I.file_path)}`},inputSchema:Kv3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!bE(j7.getPath(I),G)},renderToolUseRejectedMessage({file_path:I,content:G},{columns:Z,verbose:W}){try{let B=Sf1(I)?I:Lf1(P0(),I),w=Mf1(B),V=w?ZB(B):"utf-8",Y=w?gL2(B,V):null,C=Y?"update":"create",A=eA({filePath:I,fileContents:Y??"",oldStr:Y??"",newStr:G});return j9.createElement(l,{flexDirection:"column"},j9.createElement(b,null,"  ","⎿"," ",j9.createElement(b,{color:s1().error},"User rejected ",C==="update"?"update":"write"," to"," "),j9
```

##### Snippet 7

```javascript
verflow:"hidden"},Ob.createElement(b,null,"  ","⎿  "),I)}var UL3=G1.strictObject({url:G1.string().url().describe("The URL to fetch content from"),prompt:G1.string().describe("The prompt to run on the fetched content")}),RG={name:$L2,async description(I){let{url:G}=I;try{return`Claude wants to fetch content from ${new URL(G).hostname}`}catch{return"Claude wants to fetch content from this URL"}},userFacingName(){return"Web Fetch"},async isEnabled(){return!0},inputSchema:UL3,isReadOnly(){return!0},needsPermissions(I){return!0},async prompt(){return EL2},async validateInput(I,G){let{url:Z}=I;if(!G.userProvidedUrls.has(Z))return{result:!1,message:`Error: URL "${Z}" was not provided by the user. For security, you can only fetch URLs that were explicitly shared by the user in their messages.`,meta:{reason:"url_not_provided_by_user"}};return{result:!0}},renderToolUseMessage({url:I,prompt:G},{verbose:Z}){return`url: "${I}"${Z?`, prompt: "${G}"`:""}`},renderToolUseRejectedMessage(){return ub.def
```

##### Snippet 8

```javascript
nteractiveSession),durationMs:Date.now()-Z,url:W}}}catch(V){Z0(V),yield{type:"result",data:{result:`Error: ${V instanceof Error?V.message:"Unknown error"}`,durationMs:Date.now()-Z,url:W}}}},renderResultForAssistant(I){return I.result}};function gL3(I){return[...d4().allowedTools,...I.getToolPermissionContext().alwaysAllowRules.cli||[]]}var cK=async(I,G,Z,W,B)=>{if(Z.getToolPermissionContext().mode==="bypassPermissions")return{result:!0};if(Z.abortController.signal.aborted)throw new aZ;try{if(!I.needsPermissions(G,{writeFileAllowedDirectories:B}))return{result:!0}}catch(V){return Z0(V),{result:!1,message:"Error checking permissions"}}let w=gL3(Z);if(I===u4&&w.includes(u4.name))return{result:!0};switch(I){case u4:{let{command:V}=Tb.parse(G);return await GT2(V,Z,w)}case b7:case j7:case QG:{if(w.includes(BN(I,G,null)))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}default:{let V=BN(I,G,null);if(w.includes(V))retu
```

##### Snippet 9

```javascript
ncies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`,isNonInteractiveSession:G});return(Z.message.content[0]?.type==="text"?Z.message.content[0].text:null)||"Executes a bash command"}catch(Z){return Z0(Z),"Executes a bash command"}},async prompt(){return CL2},isReadOnly({command:I}){return fK(I).every((G)=>{for(let Z of SL3)if(Z.test(G))return!0;return!1})},inputSchema:Tb,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let[G,Z]=WT2(I);if(G&&Z)return{result:!1,message:`Command '${Z}' is not allowed`};let W=BT2(I);if(!W.result)return W;return{result:!0}},renderToolUseMessage({command:I}){if(I.includes(`"$(cat <<'EOF'`)){let G=I.match(/^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/);if(G&&G[1]&&G[2]){let Z=G[1],W=G[2],B=G[3]||"";return`${Z.trim()} "${W.trim()}"${B.trim()}`}}return I},renderToolUseRejectedMessage(){return mb.createElement(G6,
```

##### Snippet 10

```javascript
or:!0},"Cost: $",I.toFixed(4)," (",W,"s)"))}import{isAbsolute as eu3,relative as tu3,resolve as IT3}from"path";var GT3=G1.strictObject({pattern:G1.string().describe("The glob pattern to match files against"),path:G1.string().optional().describe("The directory to search in. Defaults to the current working directory.")}),c7={name:B21,async description(){return ff1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:GT3,isReadOnly(){return!0},getPath({path:I}){return I||P0()},needsPermissions(I){return!hA(c7.getPath(I))},async prompt(){return ff1},renderToolUseMessage({pattern:I,path:G},{verbose:Z}){let W=G?eu3(G)?G:IT3(P0(),G):void 0,B=W?tu3(P0(),W):void 0;return`pattern: "${I}"${B||Z?`, path: "${Z?W:B}"`:""}`},renderToolUseRejectedMessage(){return tK.default.createElement(G6,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return tK.default.createElement(l,{justifyContent:"space-between",width:"100%"},tK.default.createElement(l,{flexDirectio
```

##### Snippet 11

```javascript
tern:G1.string().describe("The regular expression pattern to search for in file contents"),path:G1.string().optional().describe("The directory to search in. Defaults to the current working directory."),include:G1.string().optional().describe('File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")')}),Rk2=100,NW={name:w21,async description(){return $f1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:WT3,isReadOnly(){return!0},getPath({path:I}){return I||P0()},needsPermissions({path:I}){return!hA(I||P0())},async prompt(){return $f1},renderToolUseMessage({pattern:I,path:G,include:Z},{verbose:W}){let{absolutePath:B,relativePath:w}=R80(G);return`pattern: "${I}"${w||W?`, path: "${W?B:w}"`:""}${Z?`, include: "${Z}"`:""}`},renderToolUseRejectedMessage(){return Id.default.createElement(G6,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return Id.default.createElement(l,{justifyContent:"space-between",width:"100%"},Id.default.createElement(l,{fle
```

##### Snippet 12

```javascript
Array(B.content))return B.content.map((V)=>{if(V.type==="image")return{type:"image",source:{type:"base64",data:String(V.data),media_type:V.mimeType}};return V});let w=`Unexpected response format from tool ${Z}`;throw iX(G,w),Error(w)}var T5=F1(L1(),1);var $x2="",Ex2="";var xm3=G1.object({}).passthrough(),vx2={isMcp:!0,async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return Ex2},async prompt(){return $x2},inputSchema:xm3,async*call(){yield{type:"result",data:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return T5.createElement(G6,null)},renderToolResultMessage(I,{verbose:G}){if(Array.isArray(I))return T5.createElement(l,{flexDirection:"column"},I.map((W,B)=>{if(W.type==="image")return T5.createElement(l,{key:B,justifyContent:"space-between",overflowX:"hidden",width:"100%"},T5.createElement(l,{flexDirection:"r
```

##### Snippet 13

```javascript
e.cache_creation_input_tokens??0)+(O.message.usage.cache_read_input_tokens??0)+O.message.usage.input_tokens+O.message.usage.output_tokens)+" tokens",Oq(Date.now()-F)];yield{type:"progress",message:E5({content:`Done (${u.join(" · ")})`,usage:O.message.usage}),normalizedMessages:M,tools:D,parentMessageID:X.message.id,toolUseID:z,isResolved:!0}}yield{type:"result",data:O.message.content.filter((u)=>u.type==="text")}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:G}){let Z=I.split(Vk3);return av(!G&&Z.length>1?Z[0]+"…":I)},renderToolUseRejectedMessage(){return LM1.createElement(G6,null)}};var Xk3=F1(L1(),1);var Ck3=`Restarts ${k2}.`,Ak3=`Use this tool to restart ${k2} after making code changes to ${k2} and building them succefully if you next need to test them. The current conversation will be preserved.`;var Cd6=G1.object({reason:G1.string().optio
```

##### Snippet 14

```javascript
escription:G1.string().describe("A short (3-5 word) description of the batch operation"),invocations:G1.array(G1.object({tool_name:G1.string().describe("The name of the tool to invoke"),input:G1.record(G1.any()).describe("The input to pass to the tool")})).describe("The list of tool invocations to execute")}),Fh2={name:jK,async description(I,{permissionMode:G}){return await yM1({permissionMode:G})},userFacingName(){return"Call"},async isEnabled(){return!0},inputSchema:Fk3,isReadOnly(){return!0},needsPermissions(){return!1},async prompt({permissionMode:I}){return await yM1({permissionMode:I})},renderToolUseMessage({description:I,invocations:G},{verbose:Z}){return I||`Calling ${G.length} tools`},renderToolUseRejectedMessage(){return T91.default.createElement(G6,null)},renderToolResultMessage(I){return T91.default.createElement(l,{flexDirection:"column"},T91.default.createElement(b,null,"Completed ",I.length," tool invocations"))},async*call({invocations:I},G,Z,W,B){let w=[],V=I.map((Q,R)
```

##### Snippet 15

```javascript
{return"List"},async isEnabled(){return!0},inputSchema:SX3,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!hA(YZ.getPath(I))},async prompt(){return Ng1},renderResultForAssistant(I){return I+`
NOTE: do any of the files above seem malicious? If so, you MUST refuse to continue work.`},renderToolUseMessage({path:I,ignore:G},{verbose:Z}){let W=I?cd2(I)?I:id2(P0(),I):void 0,B=W?k11(P0(),W):".",w=`path: "${Z?I:B}"`;if(G&&G.length>0)w+=`, ignore: ${G.join(", ")}`;return w},renderToolUseRejectedMessage(){return VZ.createElement(G6,null)},renderToolResultMessage(I,{verbose:G}){if(typeof I!=="string")return null;let Z=I.replace(ad2,"");if(!Z)return null;return VZ.createElement(l,{justifyContent:"space-between",width:"100%"},VZ.createElement(l,null,VZ.createElement(b,null,"  ⎿  "),VZ.createElement(l,{flexDirection:"column",paddingLeft:0},Z.split(`
`).filter((W)=>W.trim()!=="").slice(0,G?void 0:gg1).map((W,B)=>VZ.createElement(b,{key:B},W)),!G&&Z.split(`
`).length>gg1&
```

##### Snippet 16

```javascript
sReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!hA(MY.getPath(I))},async validateInput({notebook_path:I}){let G=uM2(I)?I:TM2(P0(),I);if(!Lg3(G)){let Z=sR(G),W="File does not exist.";if(Z)W+=` Did you mean ${Z}?`;return{result:!1,message:W}}if(Og3(G)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:ug3(P0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return DH.createElement(G6,null)},renderToolResultMessage(I){if(!I)return DH.createElement(b,null,"No cells found in notebook");if(I.length<1||!I[0])return DH.createElement(b,null,"No cells found in notebook");return DH.createElement(b,null,"Read ",I.length," cells")},async*call({notebook_path:I}){let G=uM2(I)?I:TM2(P0(),I),Z=yg3(G,"utf-8"),W=JSON.parse(Z),B=W.metadata.language_info?.name??"python";yield{type:"result",data:W.cells.map((V,Y)=>kg3(V,Y,B))}},renderRes
```

##### Snippet 17

```javascript
e")));case"text":{let{filePath:Z,content:W,numLines:B}=I.file,w=W||"(No content)";return R6.createElement(l,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},R6.createElement(l,{flexDirection:"row"},R6.createElement(b,null,"  ⎿  "),R6.createElement(l,{flexDirection:"column"},R6.createElement(yK,{code:G?w:w.split(`
`).slice(0,qf1).filter((V)=>V.trim()!=="").join(`
`),language:xE3(Z).slice(1)}),!G&&B>qf1&&R6.createElement(b,{color:s1().secondaryText},"... (+",B-qf1," lines)"))))}}},renderToolUseRejectedMessage(){return R6.createElement(G6,null)},async validateInput({file_path:I,offset:G,limit:Z}){let W=rW1(I);if(eR(W))return{result:!1,message:"File is in a directory that is ignored by your project configuration."};if(!kE3(W)){let Y=sR(W),C="File does not exist.";if(Y)C+=` Did you mean ${Y}?`;return{result:!1,message:C}}let w=YL2(W).size,V=Uf1.extname(W).toLowerCase();if(!Z21.has(V)){if(w>W21&&!G&&!Z)return{result:!1,message:Rf1(w),meta:{fileSize:w}}}return{result:!0}},asyn
```

##### Snippet 18

```javascript
urn!bE(QG.getPath(I),G)},renderResultForAssistant({cell_number:I,edit_mode:G,new_source:Z,error:W}){if(W)return W;switch(G){case"replace":return`Updated cell ${I} with ${Z}`;case"insert":return`Inserted cell ${I} with ${Z}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:G}){return`notebook_path: ${G?I.notebook_path:tE3(P0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I.edit_mode??"replace"}`},renderToolUseRejectedMessage(){return JZ.createElement(G6,null)},renderToolResultMessage({cell_number:I,new_source:G,language:Z,error:W}){if(W)return JZ.createElement(l,{flexDirection:"column"},JZ.createElement(b,{color:"red"},W));return JZ.createElement(l,{flexDirection:"column"},JZ.createElement(b,null,"Updated cell ",I,":"),JZ.createElement(l,{marginLeft:2},JZ.createElement(yK,{code:G,language:Z})))},async validateInput({notebook_path:I,cell_number:G,cell_type:Z,edit_mode:W="replace"}){let B=
```

##### Snippet 19

```javascript
mpt(){return KL2},userFacingName({old_string:I}){if(I==="")return"Create";return"Update"},async isEnabled(){return!0},inputSchema:Vv3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!bE(I.file_path,G)},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:zL2(P0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:G},{verbose:Z}){return f6.createElement(Y21,{filePath:I,structuredPatch:G,verbose:Z})},renderToolUseRejectedMessage({file_path:I,old_string:G,new_string:Z},{columns:W,verbose:B}){try{let{patch:w}=Hb(I,G,Z);return f6.createElement(l,{flexDirection:"column"},f6.createElement(b,null,"  ","⎿"," ",f6.createElement(b,{color:s1().error},"User rejected ",G===""?"write":"update"," to"," "),f6.createElement(b,{bold:!0},B?I:zL2(P0(),I))),oA(w.map((V)=>f6.createElement(l,{flexDirection:"column",paddingLeft:5,key:V.newStart},f6.createElement(XW,{patch:V,dim:!0,width:W-12}))),(V)=>f6.createElem
```

##### Snippet 20

```javascript
te, not relative)"),content:G1.string().describe("The content to write to the file")}),j7={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return UL2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:G}){return`file_path: ${G?I.file_path:Pf1(P0(),I.file_path)}`},inputSchema:Kv3,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:G}){return!bE(j7.getPath(I),G)},renderToolUseRejectedMessage({file_path:I,content:G},{columns:Z,verbose:W}){try{let B=Sf1(I)?I:Lf1(P0(),I),w=Mf1(B),V=w?ZB(B):"utf-8",Y=w?gL2(B,V):null,C=Y?"update":"create",A=eA({filePath:I,fileContents:Y??"",oldStr:Y??"",newStr:G});return j9.createElement(l,{flexDirection:"column"},j9.createElement(b,null,"  ","⎿"," ",j9.createElement(b,{color:s1().error},"User rejected ",C==="update"?"update":"write"," to"," "),j9.createElement(b,{bold:!0},W?I:Pf1(P0(),I))),oA(A.map((X)=>j9.createElement(l,{f
```

##### Snippet 21

```javascript
n!0},inputSchema:UL3,isReadOnly(){return!0},needsPermissions(I){return!0},async prompt(){return EL2},async validateInput(I,G){let{url:Z}=I;if(!G.userProvidedUrls.has(Z))return{result:!1,message:`Error: URL "${Z}" was not provided by the user. For security, you can only fetch URLs that were explicitly shared by the user in their messages.`,meta:{reason:"url_not_provided_by_user"}};return{result:!0}},renderToolUseMessage({url:I,prompt:G},{verbose:Z}){return`url: "${I}"${Z?`, prompt: "${G}"`:""}`},renderToolUseRejectedMessage(){return ub.default.createElement(G6,null)},renderToolResultMessage(){return ub.default.createElement(l,{justifyContent:"space-between",width:"100%"},ub.default.createElement(KW,null,ub.default.createElement(b,null,"Success")))},async*call(I,G){let Z=Date.now(),{url:W,prompt:B}=I,{abortController:w}=G;if(!G.userProvidedUrls.has(W))throw new Error(`Error: URL "${W}" was not provided by the user. For security, you can only fetch URLs that were explicitly shared by the 
```

##### Snippet 22

```javascript
serFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let[G,Z]=WT2(I);if(G&&Z)return{result:!1,message:`Command '${Z}' is not allowed`};let W=BT2(I);if(!W.result)return W;return{result:!0}},renderToolUseMessage({command:I}){if(I.includes(`"$(cat <<'EOF'`)){let G=I.match(/^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/);if(G&&G[1]&&G[2]){let Z=G[1],W=G[2],B=G[3]||"";return`${Z.trim()} "${W.trim()}"${B.trim()}`}}return I},renderToolUseRejectedMessage(){return mb.createElement(G6,null)},renderToolResultMessage(I,{verbose:G}){return mb.createElement(V21,{content:I,verbose:G})},renderResultForAssistant({interrupted:I,stdout:G,stderr:Z,isImage:W}){if(W){let V=G.trim().match(/^data:([^;]+);base64,(.+)$/);if(V){let Y=V[1],C=V[2];return[{type:"image",source:{type:"base64",media_type:Y||"image/jpeg",data:C||""}}]}return G.trim()}let B=Z.trim();if(I){if(Z)B+=i21;B+="<error>Command was aborted before completion</error>"}le
```

##### Snippet 23

```javascript
ibe("The directory to search in. Defaults to the current working directory.")}),c7={name:B21,async description(){return ff1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:GT3,isReadOnly(){return!0},getPath({path:I}){return I||P0()},needsPermissions(I){return!hA(c7.getPath(I))},async prompt(){return ff1},renderToolUseMessage({pattern:I,path:G},{verbose:Z}){let W=G?eu3(G)?G:IT3(P0(),G):void 0,B=W?tu3(P0(),W):void 0;return`pattern: "${I}"${B||Z?`, path: "${Z?W:B}"`:""}`},renderToolUseRejectedMessage(){return tK.default.createElement(G6,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return tK.default.createElement(l,{justifyContent:"space-between",width:"100%"},tK.default.createElement(l,{flexDirection:"row"},tK.default.createElement(b,null,"  ⎿  Found "),tK.default.createElement(b,{bold:!0},I.numFiles," "),tK.default.createElement(b,null,I.numFiles===0||I.numFiles>1?"files":"file")),tK.default.createElement(eK,{costUSD:0,durationMs:I.du
```

##### Snippet 24

```javascript
lude in the search (e.g. "*.js", "*.{ts,tsx}")')}),Rk2=100,NW={name:w21,async description(){return $f1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:WT3,isReadOnly(){return!0},getPath({path:I}){return I||P0()},needsPermissions({path:I}){return!hA(I||P0())},async prompt(){return $f1},renderToolUseMessage({pattern:I,path:G,include:Z},{verbose:W}){let{absolutePath:B,relativePath:w}=R80(G);return`pattern: "${I}"${w||W?`, path: "${W?B:w}"`:""}${Z?`, include: "${Z}"`:""}`},renderToolUseRejectedMessage(){return Id.default.createElement(G6,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return Id.default.createElement(l,{justifyContent:"space-between",width:"100%"},Id.default.createElement(l,{flexDirection:"row"},Id.default.createElement(b,null,"  ⎿  Found "),Id.default.createElement(b,{bold:!0},I.numFiles," "),Id.default.createElement(b,null,I.numFiles===0||I.numFiles>1?"files":"file")),Id.default.createElement(eK,{costUSD:0,durationMs:I.durationMs,deb
```

##### Snippet 25

```javascript
turn Z}function x41(I,G,Z){return fk2.useMemo(()=>{let W=BT3(I,Z);if(!W)throw new ReferenceError(`Tool use not found for tool_use_id ${I}`);let B=[...G,c7,NW].find((w)=>w.name===W.name);if(B===c7||B===NW)t1("tengu_legacy_tool_lookup",{});if(!B)throw new ReferenceError(`Tool not found for ${W.name}`);return{tool:B,toolUse:W}},[I,Z,G])}function $k2({toolUseID:I,tools:G,messages:Z,verbose:W}){let{columns:B}=u3(),{tool:w,toolUse:V}=x41(I,G,Z),Y=w.inputSchema.safeParse(V.input);if(Y.success)return w.renderToolUseRejectedMessage(Y.data,{columns:B,verbose:W});return Fv1.createElement(G6,null)}var Jv1=F1(L1(),1);function Ek2({param:I,message:G,messages:Z,tools:W,verbose:B,width:w}){let{tool:V}=x41(I.tool_use_id,W,Z);if(!G.toolUseResult)return null;return Jv1.createElement(l,{flexDirection:"column",width:w},V.renderToolResultMessage?.(G.toolUseResult,{verbose:B}))}function vk2({param:I,message:G,messages:Z,tools:W,verbose:B,width:w}){if(I.content===rK)return EH.createElement(Uk2,null);if(I.cont
```

##### Snippet 26

```javascript
});let w=`Unexpected response format from tool ${Z}`;throw iX(G,w),Error(w)}var T5=F1(L1(),1);var $x2="",Ex2="";var xm3=G1.object({}).passthrough(),vx2={isMcp:!0,async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return Ex2},async prompt(){return $x2},inputSchema:xm3,async*call(){yield{type:"result",data:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([G,Z])=>`${G}: ${JSON.stringify(Z)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return T5.createElement(G6,null)},renderToolResultMessage(I,{verbose:G}){if(Array.isArray(I))return T5.createElement(l,{flexDirection:"column"},I.map((W,B)=>{if(W.type==="image")return T5.createElement(l,{key:B,justifyContent:"space-between",overflowX:"hidden",width:"100%"},T5.createElement(l,{flexDirection:"row"},T5.createElement(b,null,"  ⎿  "),T5.createElement(b,null,"[Image]")));let w=W.text.split(`
`).length;return T5.createElement(Kv,{key:B,content:W.text,lin
```

##### Snippet 27

```javascript
eld{type:"progress",message:E5({content:`Done (${u.join(" · ")})`,usage:O.message.usage}),normalizedMessages:M,tools:D,parentMessageID:X.message.id,toolUseID:z,isResolved:!0}}yield{type:"result",data:O.message.content.filter((u)=>u.type==="text")}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:G}){let Z=I.split(Vk3);return av(!G&&Z.length>1?Z[0]+"…":I)},renderToolUseRejectedMessage(){return LM1.createElement(G6,null)}};var Xk3=F1(L1(),1);var Ck3=`Restarts ${k2}.`,Ak3=`Use this tool to restart ${k2} after making code changes to ${k2} and building them succefully if you next need to test them. The current conversation will be preserved.`;var Cd6=G1.object({reason:G1.string().optional().describe("Optional reason for the restart")});var T91=F1(L1(),1);var _k3=v2(async()=>{let I=[Cd,u4,c7,NW,YZ,FZ,b7,j7,MY,QG,RG],G=await Promise.all(I.map((Z)=>Z.isE
```

##### Snippet 28

```javascript
1.any()).describe("The input to pass to the tool")})).describe("The list of tool invocations to execute")}),Fh2={name:jK,async description(I,{permissionMode:G}){return await yM1({permissionMode:G})},userFacingName(){return"Call"},async isEnabled(){return!0},inputSchema:Fk3,isReadOnly(){return!0},needsPermissions(){return!1},async prompt({permissionMode:I}){return await yM1({permissionMode:I})},renderToolUseMessage({description:I,invocations:G},{verbose:Z}){return I||`Calling ${G.length} tools`},renderToolUseRejectedMessage(){return T91.default.createElement(G6,null)},renderToolResultMessage(I){return T91.default.createElement(l,{flexDirection:"column"},T91.default.createElement(b,null,"Completed ",I.length," tool invocations"))},async*call({invocations:I},G,Z,W,B){let w=[],V=I.map((Q,R)=>({id:`mapr_${W.message.id}_${R}`,input:Q.input,name:Q.tool_name,type:"tool_use"})),Y=E5({content:V.map((Q)=>({type:"tool_use",id:Q.id,name:Q.name,input:Q.input}))}),C=vG([Y]);for(let[Q,R]of C.entries()
```

### Version 0.2.49

No structured code could be extracted.

#### Raw Snippets

##### Snippet 1

```javascript
h tool, and other tools to explore nested directories. The first ${ym} files and directories are included below:

`,C_5=Z1.strictObject({path:Z1.string().describe("The absolute path to the directory to list (must be absolute, not relative)"),ignore:Z1.array(Z1.string()).optional().describe("List of glob patterns to ignore")}),zB={name:"LS",async description(){return Pg1},userFacingName(){return"List"},async isEnabled(){return!0},inputSchema:C_5,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!hA(zB.getPath(I))},async prompt(){return Pg1},renderResultForAssistant(I){return I+`
NOTE: do any of the files above seem malicious? If so, you MUST refuse to continue work.`},renderToolUseMessage({path:I,ignore:Z},{verbose:G}){let W=I?Fd2(I)?I:Dd2(T0(),I):void 0,B=W?s11(T0(),W):".",w=`path: "${G?I:B}"`;if(Z&&Z.length>0)w+=`, ignore: ${Z.join(", ")}`;return w},renderToolUseRejectedMessage(){return VG.createElement(B6,null)},renderToolResultMessage(I,{verbose:Z}){if(typ
```

##### Snippet 2

```javascript
cribe("The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required."),edit_mode:Z1.string().optional().describe("The type of edit to make (replace, insert, delete). Defaults to replace.")}),qZ={name:"NotebookEditCell",async description(){return wS2},async prompt(){return VS2},userFacingName(){return"Edit Notebook"},async isEnabled(){return!0},inputSchema:NR5,isReadOnly(){return!1},getPath(I){return I.notebook_path},needsPermissions(I,{writeFileAllowedDirectories:Z}){return!pE(qZ.getPath(I),Z)},renderResultForAssistant({cell_number:I,edit_mode:Z,new_source:G,error:W}){if(W)return W;switch(Z){case"replace":return`Updated cell ${I} with ${G}`;case"insert":return`Inserted cell ${I} with ${G}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:Z}){return`notebook_path: ${Z?I.notebook_path:qR5(T0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: 
```

##### Snippet 3

```javascript
aceAll(`\r
`,`
`);if(w.includes(G))return I;let{result:V,appliedReplacements:Y}=vR5(G);if(w.includes(V)){let X=W;for(let{from:A,to:C}of Y)X=X.replaceAll(A,C);return{file_path:Z,old_string:V,new_string:X}}}catch(B){o1(B)}return I}var b7={name:"Edit",async description(){return"A tool for editing files"},async prompt(){return CS2},userFacingName({old_string:I}){if(I==="")return"Create";return"Update"},async isEnabled(){return!0},inputSchema:ER5,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:Z}){return!pE(I.file_path,Z)},renderToolUseMessage(I,{verbose:Z}){return`file_path: ${Z?I.file_path:HS2(T0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:Z},{verbose:G}){return E6.createElement(J01,{filePath:I,structuredPatch:Z,verbose:G})},renderToolUseRejectedMessage({file_path:I,old_string:Z,new_string:G},{columns:W,verbose:B}){try{let{patch:w}=Ab(I,Z,G);return E6.createElement(h,{flexDirection:"column"},E6.createElement(m
```

##### Snippet 4

```javascript
ath:Z1.string().describe("The absolute path to the file to write (must be absolute, not relative)"),content:Z1.string().describe("The content to write to the file")}),j7={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return KS2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:Z}){return`file_path: ${Z?I.file_path:Df1(T0(),I.file_path)}`},inputSchema:mR5,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:Z}){return!pE(j7.getPath(I),Z)},renderToolUseRejectedMessage({file_path:I,content:Z},{columns:G,verbose:W}){try{let B=Jf1(I)?I:Kf1(T0(),I),w=Ff1(B),V=w?IB(B):"utf-8",Y=w?zS2(B,V):null,X=Y?"update":"create",A=pA({filePath:I,fileContents:Y??"",oldStr:Y??"",newStr:Z});return l9.createElement(h,{flexDirection:"column"},l9.createElement(m,null,"  ","⎿"," ",l9.createElement(m,{color:G0().error},"User rejected ",X==="update"?"update":"write"," to"," "),l9
```

##### Snippet 5

```javascript
verflow:"hidden"},Pb.createElement(m,null,"  ","⎿  "),I)}var lM5=Z1.strictObject({url:Z1.string().url().describe("The URL to fetch content from"),prompt:Z1.string().describe("The prompt to run on the fetched content")}),oA={name:qS2,async description(I){let{url:Z}=I;try{return`Claude wants to fetch content from ${new URL(Z).hostname}`}catch{return"Claude wants to fetch content from this URL"}},userFacingName(){return"Web Fetch"},async isEnabled(){return!1},inputSchema:lM5,isReadOnly(){return!0},needsPermissions(I){return!0},async prompt(){return NS2},async validateInput(I,Z){let{url:G}=I;if(!Z.userProvidedUrls.has(G))return{result:!1,message:`Error: URL "${G}" was not provided by the user. For security, you can only fetch URLs that were explicitly shared by the user in their messages.`,meta:{reason:"url_not_provided_by_user"}};return{result:!0}},renderToolUseMessage({url:I,prompt:Z},{verbose:G}){return`url: "${I}"${G?`, prompt: "${Z}"`:""}`},renderToolUseRejectedMessage(){return Lb.def
```

##### Snippet 6

```javascript
sNonInteractiveSession),durationMs:Date.now()-G,url:W}}}catch(V){o1(V),yield{type:"result",data:{result:`Error: ${V instanceof Error?V.message:"Unknown error"}`,durationMs:Date.now()-G,url:W}}}},renderResultForAssistant(I){return I.result}};function j$1(I){return[...I.alwaysAllowRules.cliArg||[],...I.alwaysAllowRules.localSettings||[]]}var jK=async(I,Z,G,W,B)=>{if(G.getToolPermissionContext().mode==="bypassPermissions")return{result:!0};if(G.abortController.signal.aborted)throw new cG;try{if(!I.needsPermissions(Z,{writeFileAllowedDirectories:B}))return{result:!0}}catch(V){return o1(V),{result:!1,message:"Error checking permissions"}}let w=j$1(G.getToolPermissionContext());if(I===T4&&w.includes(T4.name))return{result:!0};switch(I){case T4:{let{command:V}=yb.parse(Z);return await ry2(V,G,w)}case b7:case j7:case qZ:{if(w.includes(YN(I,Z,null)))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}default:{let V=YN(I,Z,
```

##### Snippet 7

```javascript
ncies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`,isNonInteractiveSession:Z});return(G.message.content[0]?.type==="text"?G.message.content[0].text:null)||"Executes a bash command"}catch(G){return o1(G),"Executes a bash command"}},async prompt(){return pQ2},isReadOnly({command:I}){return $K(I).every((Z)=>{for(let G of sM5)if(G.test(Z))return!0;return!1})},inputSchema:yb,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let[Z,G]=oy2(I);if(Z&&G)return{result:!1,message:`Command '${G}' is not allowed`};let W=ey2(I,T0(),T3());if(!W.result)return W;return{result:!0}},renderToolUseMessage({command:I}){if(I.includes(`"$(cat <<'EOF'`)){let Z=I.match(/^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/);if(Z&&Z[1]&&Z[2]){let G=Z[1],W=Z[2],B=Z[3]||"";return`${G.trim()} "${W.trim()}"${B.trim()}`}}return I},renderToolUseRejectedMessage(){return Ob.createE
```

##### Snippet 8

```javascript
or:!0},"Cost: $",I.toFixed(4)," (",W,"s)"))}import{isAbsolute as EL5,relative as ML5,resolve as vL5}from"path";var SL5=Z1.strictObject({pattern:Z1.string().describe("The glob pattern to match files against"),path:Z1.string().optional().describe("The directory to search in. Defaults to the current working directory.")}),c7={name:C01,async description(){return BR1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:SL5,isReadOnly(){return!0},getPath({path:I}){return I||T0()},needsPermissions(I){return!hA(c7.getPath(I))},async prompt(){return BR1},renderToolUseMessage({pattern:I,path:Z},{verbose:G}){let W=Z?EL5(Z)?Z:vL5(T0(),Z):void 0,B=W?ML5(T0(),W):void 0;return`pattern: "${I}"${B||G?`, path: "${G?W:B}"`:""}`},renderToolUseRejectedMessage(){return oK.default.createElement(B6,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return oK.default.createElement(h,{justifyContent:"space-between",width:"100%"},oK.default.createElement(h,{flexDirectio
```

##### Snippet 9

```javascript
tern:Z1.string().describe("The regular expression pattern to search for in file contents"),path:Z1.string().optional().describe("The directory to search in. Defaults to the current working directory."),include:Z1.string().optional().describe('File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")')}),Rb2=100,zW={name:_01,async description(){return wR1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:LL5,isReadOnly(){return!0},getPath({path:I}){return I||T0()},needsPermissions({path:I}){return!hA(I||T0())},async prompt(){return wR1},renderToolUseMessage({pattern:I,path:Z,include:G},{verbose:W}){let{absolutePath:B,relativePath:w}=k80(Z);return`pattern: "${I}"${w||W?`, path: "${W?B:w}"`:""}${G?`, include: "${G}"`:""}`},renderToolUseRejectedMessage(){return eK.default.createElement(B6,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return eK.default.createElement(h,{justifyContent:"space-between",width:"100%"},eK.default.createElement(h,{fle
```

##### Snippet 10

```javascript
Array(B.content))return B.content.map((V)=>{if(V.type==="image")return{type:"image",source:{type:"base64",data:String(V.data),media_type:V.mimeType}};return V});let w=`Unexpected response format from tool ${G}`;throw pC(Z,w),Error(w)}var k3=H1(P1(),1);var $j2="",Ej2="";var KO5=Z1.object({}).passthrough(),Mj2={isMcp:!0,async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return Ej2},async prompt(){return $j2},inputSchema:KO5,async*call(){yield{type:"result",data:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([Z,G])=>`${Z}: ${JSON.stringify(G)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return k3.createElement(B6,null)},renderToolResultMessage(I,{verbose:Z}){if(Array.isArray(I))return k3.createElement(h,{flexDirection:"column"},I.map((W,B)=>{if(W.type==="image")return k3.createElement(h,{key:B,justifyContent:"space-between",overflowX:"hidden",width:"100%"},k3.createElement(h,{flexDirection:"r
```

##### Snippet 11

```javascript
ath to the file to read"),offset:Z1.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:Z1.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),vB={name:"View",async description(){return xj2},async prompt(){return hj2},inputSchema:xb5,userFacingName(){return"Read"},async isEnabled(){return!0},isReadOnly(){return!0},getPath({file_path:I}){return I||T0()},needsPermissions(I){return!hA(vB.getPath(I))},renderToolUseMessage(I,{verbose:Z}){let{file_path:G,...W}=I;return[["file_path",Z?G:kb5(T0(),G)],...Object.entries(W)].map(([w,V])=>`${w}: ${JSON.stringify(V)}`).join(", ")},renderToolResultMessage(I,{verbose:Z}){switch(I.type){case"image":return v6.createElement(h,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},v6.createElement(h,{flexDirection:"row"},v6.createElement(m,null,"  ⎿  "),v6.createElement(m,null,"Read image")));case"text
```

##### Snippet 12

```javascript
ute path to the Jupyter notebook file to read (must be absolute, not relative)")});function sb5(I){return I.flatMap(Gj5).reduce((G,W)=>{if(G.length===0)return[W];let B=G[G.length-1];if(B&&B.type==="text"&&W.type==="text")return B.text+=`
`+W.text,G;return[...G,W]},[])}var uH={name:"ReadNotebook",async description(){return Hh2},async prompt(){return Fh2},userFacingName(){return"Read Notebook"},async isEnabled(){return!0},inputSchema:rb5,isReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!hA(uH.getPath(I))},async validateInput({notebook_path:I}){let Z=Jh2(I)?I:Dh2(T0(),I);if(!pb5(Z)){let G=If(Z),W="File does not exist.";if(G)W+=` Did you mean ${G}?`;return{result:!1,message:W}}if(ab5(Z)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:Z}){return`notebook_path: ${Z?I.notebook_path:nb5(T0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return OH.createElement(B6,n
```

##### Snippet 13

```javascript
e.cache_creation_input_tokens??0)+(O.message.usage.cache_read_input_tokens??0)+O.message.usage.input_tokens+O.message.usage.output_tokens)+" tokens",kq(Date.now()-F)];yield{type:"progress",message:X3({content:`Done (${u.join(" · ")})`,usage:O.message.usage}),normalizedMessages:M,tools:D,parentMessageID:C.message.id,toolUseID:d,isResolved:!0}}yield{type:"result",data:O.message.content.filter((u)=>u.type==="text")}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:Z}){let G=I.split(lk5);return cM(!Z&&G.length>1?G[0]+"…":I)},renderToolUseRejectedMessage(){return av1.createElement(B6,null)}};var ak5=H1(P1(),1);var pk5=`Restarts ${x2}.`,ik5=`Use this tool to restart ${x2} after making code changes to ${x2} and building them succefully if you next need to test them. The current conversation will be preserved.`;var md6=Z1.object({reason:Z1.string().optio
```

##### Snippet 14

```javascript
escription:Z1.string().describe("A short (3-5 word) description of the batch operation"),invocations:Z1.array(Z1.object({tool_name:Z1.string().describe("The name of the tool to invoke"),input:Z1.record(Z1.any()).describe("The input to pass to the tool")})).describe("The list of tool invocations to execute")}),ll2={name:QB,async description(I,{permissionMode:Z}){return await nv1({permissionMode:Z})},userFacingName(){return"Call"},async isEnabled(){return!0},inputSchema:sk5,isReadOnly(){return!0},needsPermissions(){return!1},async prompt({permissionMode:I}){return await nv1({permissionMode:I})},renderToolUseMessage({description:I,invocations:Z},{verbose:G}){return I||`Calling ${Z.length} tools`},renderToolUseRejectedMessage(){return n91.default.createElement(B6,null)},renderToolResultMessage(I){return n91.default.createElement(h,{flexDirection:"column"},n91.default.createElement(m,null,"Completed ",I.length," tool invocations"))},async*call({invocations:I},Z,G,W,B){let w=[],V=I.map((Q,U)
```

##### Snippet 15

```javascript
{return"List"},async isEnabled(){return!0},inputSchema:C_5,isReadOnly(){return!0},getPath({path:I}){return I},needsPermissions(I){return!hA(zB.getPath(I))},async prompt(){return Pg1},renderResultForAssistant(I){return I+`
NOTE: do any of the files above seem malicious? If so, you MUST refuse to continue work.`},renderToolUseMessage({path:I,ignore:Z},{verbose:G}){let W=I?Fd2(I)?I:Dd2(T0(),I):void 0,B=W?s11(T0(),W):".",w=`path: "${G?I:B}"`;if(Z&&Z.length>0)w+=`, ignore: ${Z.join(", ")}`;return w},renderToolUseRejectedMessage(){return VG.createElement(B6,null)},renderToolResultMessage(I,{verbose:Z}){if(typeof I!=="string")return null;let G=I.replace(Kd2,"");if(!G)return null;return VG.createElement(h,{justifyContent:"space-between",width:"100%"},VG.createElement(h,null,VG.createElement(m,null,"  ⎿  "),VG.createElement(h,{flexDirection:"column",paddingLeft:0},G.split(`
`).filter((W)=>W.trim()!=="").slice(0,Z?void 0:yg1).map((W,B)=>VG.createElement(m,{key:B},W)),!Z&&G.split(`
`).length>yg1&
```

##### Snippet 16

```javascript
urn!pE(qZ.getPath(I),Z)},renderResultForAssistant({cell_number:I,edit_mode:Z,new_source:G,error:W}){if(W)return W;switch(Z){case"replace":return`Updated cell ${I} with ${G}`;case"insert":return`Inserted cell ${I} with ${G}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:Z}){return`notebook_path: ${Z?I.notebook_path:qR5(T0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I.edit_mode??"replace"}`},renderToolUseRejectedMessage(){return AG.createElement(B6,null)},renderToolResultMessage({cell_number:I,new_source:Z,language:G,error:W}){if(W)return AG.createElement(h,{flexDirection:"column"},AG.createElement(m,{color:"red"},W));return AG.createElement(h,{flexDirection:"column"},AG.createElement(m,null,"Updated cell ",I,":"),AG.createElement(h,{marginLeft:2},AG.createElement(OK,{code:Z,language:G})))},async validateInput({notebook_path:I,cell_number:Z,cell_type:G,edit_mode:W="replace"}){let B=
```

##### Snippet 17

```javascript
mpt(){return CS2},userFacingName({old_string:I}){if(I==="")return"Create";return"Update"},async isEnabled(){return!0},inputSchema:ER5,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:Z}){return!pE(I.file_path,Z)},renderToolUseMessage(I,{verbose:Z}){return`file_path: ${Z?I.file_path:HS2(T0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:Z},{verbose:G}){return E6.createElement(J01,{filePath:I,structuredPatch:Z,verbose:G})},renderToolUseRejectedMessage({file_path:I,old_string:Z,new_string:G},{columns:W,verbose:B}){try{let{patch:w}=Ab(I,Z,G);return E6.createElement(h,{flexDirection:"column"},E6.createElement(m,null,"  ","⎿"," ",E6.createElement(m,{color:G0().error},"User rejected ",Z===""?"write":"update"," to"," "),E6.createElement(m,{bold:!0},B?I:HS2(T0(),I))),cA(w.map((V)=>E6.createElement(h,{flexDirection:"column",paddingLeft:5,key:V.newStart},E6.createElement(YW,{patch:V,dim:!0,width:W-12}))),(V)=>E6.createElem
```

##### Snippet 18

```javascript
te, not relative)"),content:Z1.string().describe("The content to write to the file")}),j7={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return KS2},async isEnabled(){return!0},renderToolUseMessage(I,{verbose:Z}){return`file_path: ${Z?I.file_path:Df1(T0(),I.file_path)}`},inputSchema:mR5,isReadOnly(){return!1},getPath(I){return I.file_path},needsPermissions(I,{writeFileAllowedDirectories:Z}){return!pE(j7.getPath(I),Z)},renderToolUseRejectedMessage({file_path:I,content:Z},{columns:G,verbose:W}){try{let B=Jf1(I)?I:Kf1(T0(),I),w=Ff1(B),V=w?IB(B):"utf-8",Y=w?zS2(B,V):null,X=Y?"update":"create",A=pA({filePath:I,fileContents:Y??"",oldStr:Y??"",newStr:Z});return l9.createElement(h,{flexDirection:"column"},l9.createElement(m,null,"  ","⎿"," ",l9.createElement(m,{color:G0().error},"User rejected ",X==="update"?"update":"write"," to"," "),l9.createElement(m,{bold:!0},W?I:Df1(T0(),I))),cA(A.map((C)=>l9.createElement(h,{f
```

##### Snippet 19

```javascript
n!1},inputSchema:lM5,isReadOnly(){return!0},needsPermissions(I){return!0},async prompt(){return NS2},async validateInput(I,Z){let{url:G}=I;if(!Z.userProvidedUrls.has(G))return{result:!1,message:`Error: URL "${G}" was not provided by the user. For security, you can only fetch URLs that were explicitly shared by the user in their messages.`,meta:{reason:"url_not_provided_by_user"}};return{result:!0}},renderToolUseMessage({url:I,prompt:Z},{verbose:G}){return`url: "${I}"${G?`, prompt: "${Z}"`:""}`},renderToolUseRejectedMessage(){return Lb.default.createElement(B6,null)},renderToolResultMessage(){return Lb.default.createElement(h,{justifyContent:"space-between",width:"100%"},Lb.default.createElement(HW,null,Lb.default.createElement(m,null,"Success")))},async*call(I,Z){let G=Date.now(),{url:W,prompt:B}=I,{abortController:w}=Z;if(!Z.userProvidedUrls.has(W))throw new Error(`Error: URL "${W}" was not provided by the user. For security, you can only fetch URLs that were explicitly shared by the 
```

##### Snippet 20

```javascript
ame(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let[Z,G]=oy2(I);if(Z&&G)return{result:!1,message:`Command '${G}' is not allowed`};let W=ey2(I,T0(),T3());if(!W.result)return W;return{result:!0}},renderToolUseMessage({command:I}){if(I.includes(`"$(cat <<'EOF'`)){let Z=I.match(/^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/);if(Z&&Z[1]&&Z[2]){let G=Z[1],W=Z[2],B=Z[3]||"";return`${G.trim()} "${W.trim()}"${B.trim()}`}}return I},renderToolUseRejectedMessage(){return Ob.createElement(B6,null)},renderToolResultMessage(I,{verbose:Z}){return Ob.createElement(F01,{content:I,verbose:Z})},renderResultForAssistant({interrupted:I,stdout:Z,stderr:G,isImage:W}){if(W){let V=Z.trim().match(/^data:([^;]+);base64,(.+)$/);if(V){let Y=V[1],X=V[2];return[{type:"image",source:{type:"base64",media_type:Y||"image/jpeg",data:X||""}}]}return Z.trim()}let B=G.trim();if(I){if(G)B+=O21;B+="<error>Command was aborted before completion</error>"}le
```

##### Snippet 21

```javascript
ibe("The directory to search in. Defaults to the current working directory.")}),c7={name:C01,async description(){return BR1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:SL5,isReadOnly(){return!0},getPath({path:I}){return I||T0()},needsPermissions(I){return!hA(c7.getPath(I))},async prompt(){return BR1},renderToolUseMessage({pattern:I,path:Z},{verbose:G}){let W=Z?EL5(Z)?Z:vL5(T0(),Z):void 0,B=W?ML5(T0(),W):void 0;return`pattern: "${I}"${B||G?`, path: "${G?W:B}"`:""}`},renderToolUseRejectedMessage(){return oK.default.createElement(B6,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return oK.default.createElement(h,{justifyContent:"space-between",width:"100%"},oK.default.createElement(h,{flexDirection:"row"},oK.default.createElement(m,null,"  ⎿  Found "),oK.default.createElement(m,{bold:!0},I.numFiles," "),oK.default.createElement(m,null,I.numFiles===0||I.numFiles>1?"files":"file")),oK.default.createElement(sK,{costUSD:0,durationMs:I.du
```

##### Snippet 22

```javascript
lude in the search (e.g. "*.js", "*.{ts,tsx}")')}),Rb2=100,zW={name:_01,async description(){return wR1},userFacingName(){return"Search"},async isEnabled(){return!0},inputSchema:LL5,isReadOnly(){return!0},getPath({path:I}){return I||T0()},needsPermissions({path:I}){return!hA(I||T0())},async prompt(){return wR1},renderToolUseMessage({pattern:I,path:Z,include:G},{verbose:W}){let{absolutePath:B,relativePath:w}=k80(Z);return`pattern: "${I}"${w||W?`, path: "${W?B:w}"`:""}${G?`, include: "${G}"`:""}`},renderToolUseRejectedMessage(){return eK.default.createElement(B6,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return eK.default.createElement(h,{justifyContent:"space-between",width:"100%"},eK.default.createElement(h,{flexDirection:"row"},eK.default.createElement(m,null,"  ⎿  Found "),eK.default.createElement(m,{bold:!0},I.numFiles," "),eK.default.createElement(m,null,I.numFiles===0||I.numFiles>1?"files":"file")),eK.default.createElement(sK,{costUSD:0,durationMs:I.durationMs,deb
```

##### Snippet 23

```javascript
turn G}function P41(I,Z,G){return fb2.useMemo(()=>{let W=yL5(I,G);if(!W)throw new ReferenceError(`Tool use not found for tool_use_id ${I}`);let B=[...Z,c7,zW].find((w)=>w.name===W.name);if(B===c7||B===zW)r1("tengu_legacy_tool_lookup",{});if(!B)throw new ReferenceError(`Tool not found for ${W.name}`);return{tool:B,toolUse:W}},[I,G,Z])}function $b2({toolUseID:I,tools:Z,messages:G,verbose:W}){let{columns:B}=M5(),{tool:w,toolUse:V}=P41(I,Z,G),Y=w.inputSchema.safeParse(V.input);if(Y.success)return w.renderToolUseRejectedMessage(Y.data,{columns:B,verbose:W});return GM1.createElement(B6,null)}var WM1=H1(P1(),1);function Eb2({param:I,message:Z,messages:G,tools:W,verbose:B,width:w}){let{tool:V}=P41(I.tool_use_id,W,G);if(!Z.toolUseResult)return null;return WM1.createElement(h,{flexDirection:"column",width:w},V.renderToolResultMessage?.(Z.toolUseResult,{verbose:B}))}function Mb2({param:I,message:Z,messages:G,tools:W,verbose:B,width:w}){if(I.content===aK)return $H.createElement(Ub2,null);if(I.cont
```

##### Snippet 24

```javascript
});let w=`Unexpected response format from tool ${G}`;throw pC(Z,w),Error(w)}var k3=H1(P1(),1);var $j2="",Ej2="";var KO5=Z1.object({}).passthrough(),Mj2={isMcp:!0,async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return Ej2},async prompt(){return $j2},inputSchema:KO5,async*call(){yield{type:"result",data:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([Z,G])=>`${Z}: ${JSON.stringify(G)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return k3.createElement(B6,null)},renderToolResultMessage(I,{verbose:Z}){if(Array.isArray(I))return k3.createElement(h,{flexDirection:"column"},I.map((W,B)=>{if(W.type==="image")return k3.createElement(h,{key:B,justifyContent:"space-between",overflowX:"hidden",width:"100%"},k3.createElement(h,{flexDirection:"row"},k3.createElement(m,null,"  ⎿  "),k3.createElement(m,null,"[Image]")));let w=W.text.split(`
`).length;return k3.createElement(oE,{key:B,content:W.text,lin
```

##### Snippet 25

```javascript
e")));case"text":{let{filePath:G,content:W,numLines:B}=I.file,w=W||"(No content)";return v6.createElement(h,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},v6.createElement(h,{flexDirection:"row"},v6.createElement(m,null,"  ⎿  "),v6.createElement(h,{flexDirection:"column"},v6.createElement(OK,{code:Z?w:w.split(`
`).slice(0,Fv1).filter((V)=>V.trim()!=="").join(`
`),language:jb5(G).slice(1)}),!Z&&B>Fv1&&v6.createElement(m,{color:G0().secondaryText},"... (+",B-Fv1," lines)"))))}}},renderToolUseRejectedMessage(){return v6.createElement(B6,null)},async validateInput({file_path:I,offset:Z,limit:G}){let W=wB1(I);if(Gf(W))return{result:!1,message:"File is in a directory that is ignored by your project configuration."};if(!bb5(W)){let Y=If(W),X="File does not exist.";if(Y)X+=` Did you mean ${Y}?`;return{result:!1,message:X}}if(W.endsWith(".ipynb"))return{result:!1,message:`File is a Jupyter Notebook. Use the ${kj2} to read this file.`};let w=_h2(W).size,V=Dv1.extname(W).toLower
```

##### Snippet 26

```javascript
sReadOnly(){return!0},getPath({notebook_path:I}){return I},needsPermissions(I){return!hA(uH.getPath(I))},async validateInput({notebook_path:I}){let Z=Jh2(I)?I:Dh2(T0(),I);if(!pb5(Z)){let G=If(Z),W="File does not exist.";if(G)W+=` Did you mean ${G}?`;return{result:!1,message:W}}if(ab5(Z)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:Z}){return`notebook_path: ${Z?I.notebook_path:nb5(T0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return OH.createElement(B6,null)},renderToolResultMessage(I){if(!I)return OH.createElement(m,null,"No cells found in notebook");if(I.length<1||!I[0])return OH.createElement(m,null,"No cells found in notebook");return OH.createElement(m,null,"Read ",I.length," cells")},async*call({notebook_path:I}){let Z=Jh2(I)?I:Dh2(T0(),I),G=ib5(Z,"utf-8"),W=JSON.parse(G),B=W.metadata.language_info?.name??"python";yield{type:"result",data:W.cells.map((V,Y)=>tb5(V,Y,B))}},renderRes
```

##### Snippet 27

```javascript
eld{type:"progress",message:X3({content:`Done (${u.join(" · ")})`,usage:O.message.usage}),normalizedMessages:M,tools:D,parentMessageID:C.message.id,toolUseID:d,isResolved:!0}}yield{type:"result",data:O.message.content.filter((u)=>u.type==="text")}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:Z}){let G=I.split(lk5);return cM(!Z&&G.length>1?G[0]+"…":I)},renderToolUseRejectedMessage(){return av1.createElement(B6,null)}};var ak5=H1(P1(),1);var pk5=`Restarts ${x2}.`,ik5=`Use this tool to restart ${x2} after making code changes to ${x2} and building them succefully if you next need to test them. The current conversation will be preserved.`;var md6=Z1.object({reason:Z1.string().optional().describe("Optional reason for the restart")});var n91=H1(P1(),1);var nk5=$2(async()=>{let I=[_z,T4,c7,zW,zB,vB,b7,j7,uH,qZ,...[]],Z=await Promise.all(I.map((G)=>G.
```

##### Snippet 28

```javascript
1.any()).describe("The input to pass to the tool")})).describe("The list of tool invocations to execute")}),ll2={name:QB,async description(I,{permissionMode:Z}){return await nv1({permissionMode:Z})},userFacingName(){return"Call"},async isEnabled(){return!0},inputSchema:sk5,isReadOnly(){return!0},needsPermissions(){return!1},async prompt({permissionMode:I}){return await nv1({permissionMode:I})},renderToolUseMessage({description:I,invocations:Z},{verbose:G}){return I||`Calling ${Z.length} tools`},renderToolUseRejectedMessage(){return n91.default.createElement(B6,null)},renderToolResultMessage(I){return n91.default.createElement(h,{flexDirection:"column"},n91.default.createElement(m,null,"Completed ",I.length," tool invocations"))},async*call({invocations:I},Z,G,W,B){let w=[],V=I.map((Q,U)=>({id:`mapr_${W.message.id}_${U}`,input:Q.input,name:Q.tool_name,type:"tool_use"})),Y=X3({content:V.map((Q)=>({type:"tool_use",id:Q.id,name:Q.name,input:Q.input}))}),X=MZ([Y]);for(let[Q,U]of X.entries()
```

### Version 0.2.9

No structured code could be extracted.

#### Raw Snippets

##### Snippet 1

```javascript
k_path:s.string().describe("The absolute path to the Jupyter notebook file to read (must be absolute, not relative)")});function Ag2(I){return I.flatMap(q79).reduce((G,Z)=>{if(G.length===0)return[Z];let C=G[G.length-1];if(C&&C.type==="text"&&Z.type==="text")return C.text+=`
`+Z.text,G;return[...G,Z]},[])}var VH={name:"ReadNotebook",async description(){return Zg2},async prompt(){return Cg2},isReadOnly(){return!0},inputSchema:J79,userFacingName(){return"Read Notebook"},async isEnabled(){return!0},needsPermissions({notebook_path:I}){return!PB(I)},async validateInput({notebook_path:I}){let d=wg2(I)?I:Bg2(R0(),I);if(!D79(d)){let G=Yf(d),Z="File does not exist.";if(G)Z+=` Did you mean ${G}?`;return{result:!1,message:Z}}if(F79(d)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:d}){return`notebook_path: ${d?I.notebook_path:g79(R0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return AX.createElement(
```

##### Snippet 2

```javascript
_path:s.string().describe("The absolute path to the file to read"),offset:s.number().optional().describe("The line number to start reading from. Only provide if the file is too large to read at once"),limit:s.number().optional().describe("The number of lines to read. Only provide if the file is too large to read at once.")}),Fd={name:"View",async description(){return Vg2},async prompt(){return Xg2},inputSchema:qZ9,isReadOnly(){return!0},userFacingName(){return"Read"},async isEnabled(){return!0},needsPermissions({file_path:I}){return!PB(I||R0())},renderToolUseMessage(I,{verbose:d}){let{file_path:G,...Z}=I;return[["file_path",d?G:fZ9(R0(),G)],...Object.entries(Z)].map(([W,w])=>`${W}: ${JSON.stringify(w)}`).join(", ")},renderToolResultMessage(I,{verbose:d}){switch(I.type){case"image":return S3.createElement(p,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},S3.createElement(p,{flexDirection:"row"},S3.createElement(u,null,"  ⎿  "),S3.createElement(u,null,"Read image")));cas
```

##### Snippet 3

```javascript
1=4,r$=1000,YJ1=`There are more than ${r$} files in the repository. Use the LS tool (passing a specific path), Bash tool, and other tools to explore nested directories. The first ${r$} files and directories are included below:

`,EZ9=s.strictObject({path:s.string().describe("The absolute path to the directory to list (must be absolute, not relative)")}),zI={name:"LS",async description(){return VJ1},inputSchema:EZ9,userFacingName(){return"List"},async isEnabled(){return!0},isReadOnly(){return!0},needsPermissions({path:I}){return!PB(I)},async prompt(){return VJ1},renderResultForAssistant(I){return I},renderToolUseMessage({path:I},{verbose:d}){let G=I?$K2(I)?I:TK2(R0(),I):void 0,Z=G?_J1(R0(),G):".";return`path: "${d?I:Z}"`},renderToolUseRejectedMessage(){return NI.createElement(A3,null)},renderToolResultMessage(I,{verbose:d}){if(typeof I!=="string")return null;let G=I.replace(YJ1,"");if(!G)return null;return NI.createElement(p,{justifyContent:"space-between",width:"100%"},NI.createElement
```

##### Snippet 4

```javascript
put: Shows working tree status

          Input: npm install
          Output: Installs package dependencies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`});return(d.message.content[0]?.type==="text"?d.message.content[0].text:null)||"Executes a bash command"}catch(d){return X0(d),"Executes a bash command"}},async prompt(){return lK2},isReadOnly(){return!1},inputSchema:o$,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let d=NR(I);for(let G of d){let Z=G.split(" "),C=Z[0];if(C&&DJ1.includes(C.toLowerCase()))return{result:!1,message:`Command '${C}' is not allowed for security reasons`};if(C==="cd"&&Z[1]){let W=Z[1].replace(/^['"]|['"]$/g,""),w=bK2(W)?W:jK2(R0(),W);if(!x81(hK2(t7(),w),hK2(R0(),t7())))return{result:!1,message:`ERROR: cd to '${w}' was blocked. For security, ${K4} may only change directories to child directories of the original working d
```

##### Snippet 5

```javascript
},w=await fetch(this._endpoint,W);if(!w.ok){let B=await w.text().catch(()=>null);throw new Error(`Error POSTing to endpoint (HTTP ${w.status}): ${B}`)}}catch(C){throw(Z=this.onerror)===null||Z===void 0||Z.call(this,C),C}}}var i9=J1(u1(),1);var IQ2="",dQ2="";var Kw9=s.object({}).passthrough(),GQ2={async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return dQ2},async prompt(){return IQ2},inputSchema:Kw9,async*call(){yield{type:"result",data:"",resultForAssistant:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([d,G])=>`${d}: ${JSON.stringify(G)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return i9.createElement(A3,null)},renderToolResultMessage(I,{verbose:d}){if(Array.isArray(I))return i9.createElement(p,{flexDirection:"column"},I.map((Z,C)=>{if(Z.type==="image")return i9.createElement(p,{key:C,justifyContent:"space-between",overflowX:"hidden",width:"100%"},i9.createElement(p,{flexDirection:"r
```

##### Snippet 6

```javascript
3,width:23},Ru.createElement(u,{dimColor:!0},"Cost: $",I.toFixed(4)," (",Z,"s)"))}import{isAbsolute as Mw9,relative as Sw9,resolve as Lw9}from"path";var yw9=s.strictObject({pattern:s.string().describe("The glob pattern to match files against"),path:s.string().optional().describe("The directory to search in. Defaults to the current working directory.")}),A7={name:ys,async description(){return BJ1},userFacingName(){return"Search"},inputSchema:yw9,async isEnabled(){return!0},isReadOnly(){return!0},needsPermissions({path:I}){return!PB(I||R0())},async prompt(){return BJ1},renderToolUseMessage({pattern:I,path:d},{verbose:G}){let Z=d?Mw9(d)?d:Lw9(R0(),d):void 0,C=Z?Sw9(R0(),Z):void 0;return`pattern: "${I}"${C||G?`, path: "${G?Z:C}"`:""}`},renderToolUseRejectedMessage(){return zH.default.createElement(A3,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return zH.default.createElement(p,{justifyContent:"space-between",width:"100%"},zH.default.createElement(p,{flexDirecti
```

##### Snippet 7

```javascript
J1(u1(),1);var $w9=s.strictObject({pattern:s.string().describe("The regular expression pattern to search for in file contents"),path:s.string().optional().describe("The directory to search in. Defaults to the current working directory."),include:s.string().optional().describe('File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")')}),EQ2=100,Kd={name:Ps,async description(){return AJ1},userFacingName(){return"Search"},inputSchema:$w9,isReadOnly(){return!0},async isEnabled(){return!0},needsPermissions({path:I}){return!PB(I||R0())},async prompt(){return AJ1},renderToolUseMessage({pattern:I,path:d,include:G},{verbose:Z}){let{absolutePath:C,relativePath:W}=P40(d);return`pattern: "${I}"${W||Z?`, path: "${Z?C:W}"`:""}${G?`, include: "${G}"`:""}`},renderToolUseRejectedMessage(){return QH.default.createElement(A3,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return QH.default.createElement(p,{justifyContent:"space-between",width:"100%"},QH.default.createElement(p,{fle
```

##### Snippet 8

```javascript
(["code","markdown"]).optional().describe("The type of the cell (code or markdown). If not specified, it defaults to the current cell type. If using edit_mode=insert, this is required."),edit_mode:s.string().optional().describe("The type of edit to make (replace, insert, delete). Defaults to replace.")}),RI={name:"NotebookEditCell",async description(){return Af2},async prompt(){return Vf2},inputSchema:vB9,userFacingName(){return"Edit Notebook"},async isEnabled(){return!0},isReadOnly(){return!1},needsPermissions({notebook_path:I}){return!OR(I)},renderResultForAssistant({cell_number:I,edit_mode:d,new_source:G,error:Z}){if(Z)return Z;switch(d){case"replace":return`Updated cell ${I} with ${G}`;case"insert":return`Inserted cell ${I} with ${G}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:d}){return`notebook_path: ${d?I.notebook_path:UB9(R0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I
```

##### Snippet 9

```javascript
C,newStr:W}),updatedFile:W}}var nB9=s.strictObject({file_path:s.string().describe("The absolute path to the file to modify"),old_string:s.string().describe("The text to replace"),new_string:s.string().describe("The text to replace it with")}),Ef2=4,p7={name:"Edit",async description(){return"A tool for editing files"},async prompt(){return Df2},inputSchema:nB9,userFacingName({old_string:I,new_string:d}){if(I==="")return"Create";if(d==="")return"Delete";return"Update"},async isEnabled(){return!0},needsPermissions({file_path:I}){return!OR(I)},isReadOnly(){return!1},renderToolUseMessage(I,{verbose:d}){return`file_path: ${d?I.file_path:Uf2(R0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:d},{verbose:G}){return y3.createElement(To,{filePath:I,structuredPatch:d,verbose:G})},renderToolUseRejectedMessage({file_path:I,old_string:d,new_string:G},{columns:Z,verbose:C}){try{let{patch:W}=hK1(I,d,G);return y3.createElement(p,{flexDirection:"column"},y3.createElement(u,null,"  
```

##### Snippet 10

```javascript
ched inside the file with Grep in order to find the line numbers of what you are looking for.</NOTE>",dA9=s.strictObject({file_path:s.string().describe("The absolute path to the file to write (must be absolute, not relative)"),content:s.string().describe("The content to write to the file")}),R8={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return Mf2},inputSchema:dA9,async isEnabled(){return!0},isReadOnly(){return!1},needsPermissions({file_path:I}){return!OR(I)},renderToolUseMessage(I,{verbose:d}){return`file_path: ${d?I.file_path:xK1(R0(),I.file_path)}`},renderToolUseRejectedMessage({file_path:I,content:d},{columns:G,verbose:Z}){try{let C=kK1(I)?I:cK1(R0(),I),W=jK1(C),w=W?dd(C):"utf-8",B=W?Sf2(C,w):null,A=B?"update":"create",V=KX({filePath:I,fileContents:B??"",oldStr:B??"",newStr:d});return Y5.createElement(p,{flexDirection:"column"},Y5.createElement(u,null,"  ","⎿"," ",Y5.createElement(u,{color:r1().error}
```

##### Snippet 11

```javascript
1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`};if(W.every((B)=>{let A=w.subcommandPrefixes.get(B);if(A===void 0||A.commandInjectionDetected)return!1;return $f2(I,B,A?A.commandPrefix:null,Z)}))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}},UH=async(I,d,G,Z)=>{if(G.options.dangerouslySkipPermissions)return{result:!0};if(G.abortController.signal.aborted)throw new Ez;try{if(!I.needsPermissions(d))return{result:!0}}catch(w){return X0(`Error checking permissions: ${w}`),{result:!1,message:"Error checking permissions"}}let W=I5().allowedTools??[];if(I===G5&&W.includes(G5.name))return{result:!0};switch(I){case G5:{let{command:w}=o$.parse(d);return await ZA9(I,w,G,W)}case p7:case R8:case RI:{if(!I.needsPermissions(d))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}default:{let w=ku(I,d,null);if(W.
```

##### Snippet 12

```javascript
ame}, but you haven't granted it yet.`}},UH=async(I,d,G,Z)=>{if(G.options.dangerouslySkipPermissions)return{result:!0};if(G.abortController.signal.aborted)throw new Ez;try{if(!I.needsPermissions(d))return{result:!0}}catch(w){return X0(`Error checking permissions: ${w}`),{result:!1,message:"Error checking permissions"}}let W=I5().allowedTools??[];if(I===G5&&W.includes(G5.name))return{result:!0};switch(I){case G5:{let{command:w}=o$.parse(d);return await ZA9(I,w,G,W)}case p7:case R8:case RI:{if(!I.needsPermissions(d))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}default:{let w=ku(I,d,null);if(W.includes(w))return{result:!0};return{result:!1,message:`Claude requested permissions to use ${I.name}, but you haven't granted it yet.`}}}};async function NX(I,d,G){let Z=ku(I,d,G);if(I===p7||I===R8||I===RI){Vs();return}let C=I5();if(C.allowedTools.includes(Z))return;C.allowedTools.push(Z),C.allowedTools.sort(),o9(C)}fun
```

##### Snippet 13

```javascript
cache_creation_input_tokens??0)+(E.message.usage.cache_read_input_tokens??0)+E.message.usage.input_tokens+E.message.usage.output_tokens)+" tokens",X$(Date.now()-B)];yield{type:"progress",content:q8(`Done (${P.join(" · ")})`),normalizedMessages:Q,tools:V}}let S=E.message.content.filter((P)=>P.type==="text");yield{type:"result",data:S,normalizedMessages:Q,resultForAssistant:this.renderResultForAssistant(S),tools:V}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:d}){let G=I.split(bV9);return VU(!d&&G.length>1?G[0]+"…":I)},renderToolUseRejectedMessage(){return _N1.createElement(A3,null)}};var DK=J1(u1(),1);var Oq2=`You are an expert software architect. Your role is to analyze technical requirements and produce clear, actionable implementation plans.
These plans will then be carried out by a junior software engineer so you need to be specific and de
```

##### Snippet 14

```javascript
 whenever you need help planning how to implement a feature, solve a technical problem, or structure your code.";var jV9=[G5,zI,Fd,R8,A7,Kd],kV9=s.strictObject({prompt:s.string().describe("The technical request or coding task to analyze"),context:s.string().describe("Optional context from previous conversation or system state").optional()}),mq2={name:"Architect",async description(){return DN1},inputSchema:kV9,isReadOnly(){return!0},userFacingName(){return"Architect"},async isEnabled(){return!1},needsPermissions(){return!1},async*call({prompt:I,context:d},G,Z){let C=d?`<context>${d}</context>

${I}`:I,w=[p9(C)],B=(G.options.tools??[]).filter((X)=>jV9.map((_)=>_.name).includes(X.name)),A=await gH(cB(w,[Oq2],await j7(),Z,{...G,options:{...G.options,tools:B}}));if(A.type!=="assistant")throw new Error("Invalid response from Claude API");let V=A.message.content.filter((X)=>X.type==="text");yield{type:"result",data:V,resultForAssistant:this.renderResultForAssistant(V)}},async prompt(){return 
```

##### Snippet 15

```javascript
e(){return"Read Notebook"},async isEnabled(){return!0},needsPermissions({notebook_path:I}){return!PB(I)},async validateInput({notebook_path:I}){let d=wg2(I)?I:Bg2(R0(),I);if(!D79(d)){let G=Yf(d),Z="File does not exist.";if(G)Z+=` Did you mean ${G}?`;return{result:!1,message:Z}}if(F79(d)!==".ipynb")return{result:!1,message:"File must be a Jupyter notebook (.ipynb file)."};return{result:!0}},renderToolUseMessage(I,{verbose:d}){return`notebook_path: ${d?I.notebook_path:g79(R0(),I.notebook_path)}`},renderToolUseRejectedMessage(){return AX.createElement(A3,null)},renderToolResultMessage(I){if(!I)return AX.createElement(u,null,"No cells found in notebook");if(I.length<1||!I[0])return AX.createElement(u,null,"No cells found in notebook");return AX.createElement(u,null,"Read ",I.length," cells")},async*call({notebook_path:I}){let d=wg2(I)?I:Bg2(R0(),I),G=H79(d,"utf-8"),Z=JSON.parse(G),C=Z.metadata.language_info?.name??"python",W=Z.cells.map((w,B)=>z79(w,B,C));yield{type:"result",resultForAssis
```

##### Snippet 16

```javascript
e")));case"text":{let{filePath:G,content:Z,numLines:C}=I.file,W=Z||"(No content)";return S3.createElement(p,{justifyContent:"space-between",overflowX:"hidden",width:"100%"},S3.createElement(p,{flexDirection:"row"},S3.createElement(u,null,"  ⎿  "),S3.createElement(p,{flexDirection:"column"},S3.createElement(yB,{code:d?W:W.split(`
`).slice(0,GJ1).filter((w)=>w.trim()!=="").join(`
`),language:QZ9(G).slice(1)}),!d&&C>GJ1&&S3.createElement(u,{color:r1().secondaryText},"... (+",C-GJ1," lines)"))))}}},renderToolUseRejectedMessage(){return S3.createElement(A3,null)},async validateInput({file_path:I,offset:d,limit:G}){let Z=c81(I);if(!zZ9(Z)){let B=Yf(Z),A="File does not exist.";if(B)A+=` Did you mean ${B}?`;return{result:!1,message:A}}let W=PK2(Z).size,w=WJ1.extname(Z).toLowerCase();if(!ZJ1.has(w)){if(W>wJ1&&!d&&!G)return{result:!1,message:yK2(W),meta:{fileSize:W}}}return{result:!0}},async*call({file_path:I,offset:d=1,limit:G=void 0},{readFileTimestamps:Z}){let C=WJ1.extname(I).toLowerCase(),W
```

##### Snippet 17

```javascript
Z9=s.strictObject({path:s.string().describe("The absolute path to the directory to list (must be absolute, not relative)")}),zI={name:"LS",async description(){return VJ1},inputSchema:EZ9,userFacingName(){return"List"},async isEnabled(){return!0},isReadOnly(){return!0},needsPermissions({path:I}){return!PB(I)},async prompt(){return VJ1},renderResultForAssistant(I){return I},renderToolUseMessage({path:I},{verbose:d}){let G=I?$K2(I)?I:TK2(R0(),I):void 0,Z=G?_J1(R0(),G):".";return`path: "${d?I:Z}"`},renderToolUseRejectedMessage(){return NI.createElement(A3,null)},renderToolResultMessage(I,{verbose:d}){if(typeof I!=="string")return null;let G=I.replace(YJ1,"");if(!G)return null;return NI.createElement(p,{justifyContent:"space-between",width:"100%"},NI.createElement(p,null,NI.createElement(u,null,"  ⎿  "),NI.createElement(p,{flexDirection:"column",paddingLeft:0},G.split(`
`).filter((Z)=>Z.trim()!=="").slice(0,d?void 0:XJ1).map((Z,C)=>NI.createElement(u,{key:C},Z)),!d&&G.split(`
`).length>XJ1&
```

##### Snippet 18

```javascript
R0(),W);if(!x81(hK2(t7(),w),hK2(R0(),t7())))return{result:!1,message:`ERROR: cd to '${w}' was blocked. For security, ${K4} may only change directories to child directories of the original working directory (${t7()}) for this session.`}}}return{result:!0}},renderToolUseMessage({command:I}){if(I.includes(`"$(cat <<'EOF'`)){let d=I.match(/^(.*?)"?\$\(cat <<'EOF'\n([\s\S]*?)\n\s*EOF\n\s*\)"(.*)$/);if(d&&d[1]&&d[2]){let G=d[1],Z=d[2],C=d[3]||"";return`${G.trim()} "${Z.trim()}"${C.trim()}`}}return I},renderToolUseRejectedMessage(){return s$.createElement(A3,null)},renderToolResultMessage(I,{verbose:d}){return s$.createElement($s,{content:I,verbose:d})},renderResultForAssistant({interrupted:I,stdout:d,stderr:G}){let Z=G.trim();if(I){if(G)Z+=us;Z+="<error>Command was aborted before completion</error>"}let C=d.trim()&&Z;return`${d.trim()}${C?`
`:""}${Z.trim()}`},async*call({command:I,timeout:d=120000},{abortController:G,readFileTimestamps:Z}){let C="",W="",w=await m8.getInstance().exec(I,G.sign
```

##### Snippet 19

```javascript
C){throw(Z=this.onerror)===null||Z===void 0||Z.call(this,C),C}}}var i9=J1(u1(),1);var IQ2="",dQ2="";var Kw9=s.object({}).passthrough(),GQ2={async isEnabled(){return!0},isReadOnly(){return!1},name:"mcp",async description(){return dQ2},async prompt(){return IQ2},inputSchema:Kw9,async*call(){yield{type:"result",data:"",resultForAssistant:""}},needsPermissions(){return!0},renderToolUseMessage(I){return Object.entries(I).map(([d,G])=>`${d}: ${JSON.stringify(G)}`).join(", ")},userFacingName:()=>"mcp",renderToolUseRejectedMessage(){return i9.createElement(A3,null)},renderToolResultMessage(I,{verbose:d}){if(Array.isArray(I))return i9.createElement(p,{flexDirection:"column"},I.map((Z,C)=>{if(Z.type==="image")return i9.createElement(p,{key:C,justifyContent:"space-between",overflowX:"hidden",width:"100%"},i9.createElement(p,{flexDirection:"row"},i9.createElement(u,null,"  ⎿  "),i9.createElement(u,null,"[Image]")));let W=Z.text.split(`
`).length;return i9.createElement(pR,{key:C,content:Z.text,lin
```

##### Snippet 20

```javascript
),path:s.string().optional().describe("The directory to search in. Defaults to the current working directory.")}),A7={name:ys,async description(){return BJ1},userFacingName(){return"Search"},inputSchema:yw9,async isEnabled(){return!0},isReadOnly(){return!0},needsPermissions({path:I}){return!PB(I||R0())},async prompt(){return BJ1},renderToolUseMessage({pattern:I,path:d},{verbose:G}){let Z=d?Mw9(d)?d:Lw9(R0(),d):void 0,C=Z?Sw9(R0(),Z):void 0;return`pattern: "${I}"${C||G?`, path: "${G?Z:C}"`:""}`},renderToolUseRejectedMessage(){return zH.default.createElement(A3,null)},renderToolResultMessage(I){if(typeof I==="string")I=JSON.parse(I);return zH.default.createElement(p,{justifyContent:"space-between",width:"100%"},zH.default.createElement(p,{flexDirection:"row"},zH.default.createElement(u,null,"  ⎿  Found "),zH.default.createElement(u,{bold:!0},I.numFiles," "),zH.default.createElement(u,null,I.numFiles===0||I.numFiles>1?"files":"file")),zH.default.createElement(NH,{costUSD:0,durationMs:I.du
```

##### Snippet 21

```javascript
nal().describe('File pattern to include in the search (e.g. "*.js", "*.{ts,tsx}")')}),EQ2=100,Kd={name:Ps,async description(){return AJ1},userFacingName(){return"Search"},inputSchema:$w9,isReadOnly(){return!0},async isEnabled(){return!0},needsPermissions({path:I}){return!PB(I||R0())},async prompt(){return AJ1},renderToolUseMessage({pattern:I,path:d,include:G},{verbose:Z}){let{absolutePath:C,relativePath:W}=P40(d);return`pattern: "${I}"${W||Z?`, path: "${Z?C:W}"`:""}${G?`, include: "${G}"`:""}`},renderToolUseRejectedMessage(){return QH.default.createElement(A3,null)},renderToolResultMessage(I){if(typeof I==="string")I=I;return QH.default.createElement(p,{justifyContent:"space-between",width:"100%"},QH.default.createElement(p,{flexDirection:"row"},QH.default.createElement(u,null,"  ⎿  Found "),QH.default.createElement(u,{bold:!0},I.numFiles," "),QH.default.createElement(u,null,I.numFiles===0||I.numFiles>1?"files":"file")),QH.default.createElement(NH,{costUSD:0,durationMs:I.durationMs,deb
```

##### Snippet 22

```javascript
return G}function Ro(I,d,G){return MQ2.useMemo(()=>{let Z=uw9(I,G);if(!Z)throw new ReferenceError(`Tool use not found for tool_use_id ${I}`);let C=[...d,A7,Kd].find((W)=>W.name===Z.name);if(C===A7||C===Kd)I0("tengu_legacy_tool_lookup",{});if(!C)throw new ReferenceError(`Tool not found for ${Z.name}`);return{tool:C,toolUse:Z}},[I,G,d])}function SQ2({toolUseID:I,tools:d,messages:G,verbose:Z}){let{columns:C}=G9(),{tool:W,toolUse:w}=Ro(I,d,G),B=W.inputSchema.safeParse(w.input);if(B.success)return W.renderToolUseRejectedMessage(B.data,{columns:C,verbose:Z});return zK1.createElement(A3,null)}var QK1=J1(u1(),1);function LQ2({param:I,message:d,messages:G,tools:Z,verbose:C,width:W}){let{tool:w}=Ro(I.tool_use_id,Z,G);return QK1.createElement(p,{flexDirection:"column",width:W},w.renderToolResultMessage?.(d.toolUseResult.data,{verbose:C}))}function yQ2({param:I,message:d,messages:G,tools:Z,verbose:C,width:W}){if(I.content===BU)return JX.createElement(UQ2,null);if(I.content===fu)return JX.createEle
```

##### Snippet 23

```javascript
gName:()=>"Think",description:async()=>$Q2,inputSchema:Tw9,isEnabled:async()=>Boolean(process.env.THINK_TOOL)&&await NY("tengu_think_tool"),isReadOnly:()=>!0,needsPermissions:()=>!1,prompt:async()=>uQ2,async*call(I,{messageId:d}){I0("tengu_thinking",{messageId:d,thoughtLength:I.thought.length.toString(),method:"tool",provider:b9?"bedrock":h9?"vertex":"1p"}),yield{type:"result",resultForAssistant:"Your thought has been logged.",data:{thought:I.thought}}},renderToolUseMessage(I){return I.thought},renderToolUseRejectedMessage(){return fK1.default.createElement(Eo,null,fK1.default.createElement(u,{color:r1().error},"Thought cancelled"))},renderResultForAssistant:()=>"Your thought has been logged."};var Tu=J1(u1(),1);function RK1(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var YK=RK1();function hQ2(I){YK=I}var Su={exec:()=>null};function C9(I,d=""){let G=typeof I==="string"?I:I.source,Z={replace:(C,W)=>{le
```

##### Snippet 24

```javascript
k_path:I}){return!OR(I)},renderResultForAssistant({cell_number:I,edit_mode:d,new_source:G,error:Z}){if(Z)return Z;switch(d){case"replace":return`Updated cell ${I} with ${G}`;case"insert":return`Inserted cell ${I} with ${G}`;case"delete":return`Deleted cell ${I}`}},renderToolUseMessage(I,{verbose:d}){return`notebook_path: ${d?I.notebook_path:UB9(R0(),I.notebook_path)}, cell: ${I.cell_number}, content: ${I.new_source.slice(0,30)}…, cell_type: ${I.cell_type}, edit_mode: ${I.edit_mode??"replace"}`},renderToolUseRejectedMessage(){return qI.createElement(A3,null)},renderToolResultMessage({cell_number:I,new_source:d,language:G,error:Z}){if(Z)return qI.createElement(p,{flexDirection:"column"},qI.createElement(u,{color:"red"},Z));return qI.createElement(p,{flexDirection:"column"},qI.createElement(u,null,"Updated cell ",I,":"),qI.createElement(p,{marginLeft:2},qI.createElement(yB,{code:d,language:G})))},async validateInput({notebook_path:I,cell_number:d,cell_type:G,edit_mode:Z="replace"}){let C=
```

##### Snippet 25

```javascript
 editing files"},async prompt(){return Df2},inputSchema:nB9,userFacingName({old_string:I,new_string:d}){if(I==="")return"Create";if(d==="")return"Delete";return"Update"},async isEnabled(){return!0},needsPermissions({file_path:I}){return!OR(I)},isReadOnly(){return!1},renderToolUseMessage(I,{verbose:d}){return`file_path: ${d?I.file_path:Uf2(R0(),I.file_path)}`},renderToolResultMessage({filePath:I,structuredPatch:d},{verbose:G}){return y3.createElement(To,{filePath:I,structuredPatch:d,verbose:G})},renderToolUseRejectedMessage({file_path:I,old_string:d,new_string:G},{columns:Z,verbose:C}){try{let{patch:W}=hK1(I,d,G);return y3.createElement(p,{flexDirection:"column"},y3.createElement(u,null,"  ","⎿"," ",y3.createElement(u,{color:r1().error},"User rejected ",d===""?"write":"update"," to"," "),y3.createElement(u,{bold:!0},C?I:Uf2(R0(),I))),hB(W.map((w)=>y3.createElement(p,{flexDirection:"column",paddingLeft:5,key:w.newStart},y3.createElement(nZ,{patch:w,dim:!0,width:Z-12}))),(w)=>y3.createEle
```

##### Snippet 26

```javascript
).describe("The absolute path to the file to write (must be absolute, not relative)"),content:s.string().describe("The content to write to the file")}),R8={name:"Replace",async description(){return"Write a file to the local filesystem."},userFacingName:()=>"Write",async prompt(){return Mf2},inputSchema:dA9,async isEnabled(){return!0},isReadOnly(){return!1},needsPermissions({file_path:I}){return!OR(I)},renderToolUseMessage(I,{verbose:d}){return`file_path: ${d?I.file_path:xK1(R0(),I.file_path)}`},renderToolUseRejectedMessage({file_path:I,content:d},{columns:G,verbose:Z}){try{let C=kK1(I)?I:cK1(R0(),I),W=jK1(C),w=W?dd(C):"utf-8",B=W?Sf2(C,w):null,A=B?"update":"create",V=KX({filePath:I,fileContents:B??"",oldStr:B??"",newStr:d});return Y5.createElement(p,{flexDirection:"column"},Y5.createElement(u,null,"  ","⎿"," ",Y5.createElement(u,{color:r1().error},"User rejected ",A==="update"?"update":"write"," to"," "),Y5.createElement(u,{bold:!0},Z?I:xK1(R0(),I))),hB(V.map((X)=>Y5.createElement(p,{f
```

##### Snippet 27

```javascript
d{type:"progress",content:q8(`Done (${P.join(" · ")})`),normalizedMessages:Q,tools:V}}let S=E.message.content.filter((P)=>P.type==="text");yield{type:"result",data:S,normalizedMessages:Q,resultForAssistant:this.renderResultForAssistant(S),tools:V}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:d}){let G=I.split(bV9);return VU(!d&&G.length>1?G[0]+"…":I)},renderToolUseRejectedMessage(){return _N1.createElement(A3,null)}};var DK=J1(u1(),1);var Oq2=`You are an expert software architect. Your role is to analyze technical requirements and produce clear, actionable implementation plans.
These plans will then be carried out by a junior software engineer so you need to be specific and detailed. However do not actually write the code, just explain the plan.

Follow these steps for each request:
1. Carefully analyze requirements to identify core functiona
```

##### Snippet 28

```javascript
nvalid response from Claude API");let V=A.message.content.filter((X)=>X.type==="text");yield{type:"result",data:V,resultForAssistant:this.renderResultForAssistant(V)}},async prompt(){return DN1},renderResultForAssistant(I){return I},renderToolUseMessage(I){return Object.entries(I).map(([d,G])=>`${d}: ${JSON.stringify(G)}`).join(", ")},renderToolResultMessage(I){return DK.createElement(p,{flexDirection:"column",gap:1},DK.createElement(yB,{code:I.map((d)=>d.text).join(`
`),language:"markdown"}))},renderToolUseRejectedMessage(){return DK.createElement(A3,null)}};var xV9=J1(u1(),1);var bl3=s.strictObject({file_path:s.string().optional().describe("Optional path to a specific memory file to read")});var cV9=J1(u1(),1);var al3=s.strictObject({file_path:s.string().describe("Path to the memory file to write"),content:s.string().describe("Content to write to the file")});var de=J1(u1(),1);var lq2="Sends the user swag stickers with love from Anthropic.",bq2=`This tool should be used whenever a us
```

##### Snippet 29

```javascript
s_optional_address:Boolean(W.address2).toString()}),G(!0),d.setToolJSX?.(null)},onClose:()=>{I0("sticker_request_form_cancelled",{}),G(!1),d.setToolJSX?.(null)}}),shouldHidePromptInput:!0});let C=await Z;if(!C)throw d.abortController.abort(),new Error("Sticker request cancelled");yield{type:"result",resultForAssistant:"Sticker request completed! Please tell the user that they will receive stickers in the mail if they have submitted the form!",data:{success:C}}},renderToolUseMessage(I){return""},renderToolUseRejectedMessage:(I)=>de.default.createElement(u,null,"  ⎿  ",de.default.createElement(u,{color:r1().error},"No (Sticker request cancelled)")),renderResultForAssistant:(I)=>I};var pq2=()=>{return[_U,G5,A7,Kd,zI,Fd,p7,R8,VH,RI,cq2,VK,...[]]},to=a2(async(I)=>{let d=[...pq2(),...await HQ2()];if(I)d.push(mq2);let G=await Promise.all(d.map((Z)=>Z.isEnabled()));return d.filter((Z,C)=>G[C])}),Tq2=a2(async()=>{let I=pq2().filter((G)=>G.isReadOnly()),d=await Promise.all(I.map((G)=>G.isEnabled
```

