he following tools: ${(await iv1(I)).map((W)=>W.name).join(", ")}. When you are searching for a keyword or file and are not confident that you will find the right match in the first few tries, use the Agent tool to perform the search for you.

When to use the Agent tool:
- If you are searching for a keyword like "config" or "logger", or for questions like "which file does X?", the Agent tool is strongly recommended

When NOT to use the Agent tool:
- If you want to read a specific file path, use the ${vB.name} or ${c7.name} tool instead of the Agent tool, to find the match more quickly
- If you are searching for a specific class definition like "class Foo", use the ${c7.name} tool instead, to find the match more quickly
- If you are searching for code within a specific file or set of 2-3 files, use the ${vB.name} tool instead of the Agent tool, to find the match more quickly

Usage notes:
1. Launch multiple agents concurrently whenever possible, to maximize performance; to do that, use a single message with multiple tool uses
2. When the agent is done, it will return a single message back to you. The result returned by the agent is not visible to the user. To show the user the result, you should send a text message back to the user with a concise summary of the result.
3. Each agent invocation is stateless. You will not be able to send additional messages to the agent, nor will the agent be able to communicate with you outside of its final report. Therefore, your prompt should contain a highly detailed task description for the agent to perform autonomously and you should specify exactly what information the agent should return back to you in its final and only message to you.
4. The agent's outputs should generally be trusted${I==="bypassPermissions"?"":`
5. IMPORTANT: The agent can not use ${T4.name}, ${j7.name}, ${b7.name}, ${qZ.name}, so can not modify files. If you want to use these tools, use them directly instead of going through the agent.`}`}var ck5=Z1.object({prompt:Z1.string().describe("The task for the agent to perform")}),_z={async prompt({permissionMode:I}){return await xl2(I||"default")},name:sE,async description(){return"Launch a new task"},inputSchema:ck5,async*call({prompt:I},{abortController:Z,options:{forkNumber:G,messageLogName:W,verbose:B,isNonInteractiveSession:w},getToolPermissionContext:V,readFileTimestamps:Y,userProvidedUrls:X},A,C,_){let F=Date.now(),D=await iv1(V().mode),z=[v5({content:I})],d=`agent_${C.message.id}`;yield{type:"progress",message:X3({content:d0.dim("Initializing…")}),normalizedMessages:MZ(z),parentMessageID:C.message.id,toolUseID:d,tools:D,isResolved:!1};let[Q,U,L,f]=await Promise.all([ZO2(),VW(w??!1),F6(),hj(z)]),R=0,$=$2(()=>as1(W,G));for await(let u of rK(z,Q,U,jK,{abortController:Z,options:{isNonInteractiveSession:w,forkNumber:G,messageLogName:W,tools:D,commands:[],verbose:B,slowAndCapableModel:L,maxThinkingTokens:f,mcpClients:[]},getToolPermissionContext:()=>V(),readFileTimestamps:Y,userProvidedUrls:X},()=>_)){if(z.push(u),pg(cF(W,G,$()),ig(z)),u.type!=="assistant")continue;let G1=MZ(z);for(let r of u.message.content){if(r.type!=="tool_use")continue;R++,yield{type:"progress",message:G1.find((D1)=>D1.type==="assistant"&&D1.message.content[0]?.type==="tool_use"&&D1.message.content[0].id===r.id),normalizedMessages:G1,tools:D,parentMessageID:C.message.id,toolUseID:d,isResolved:!1}}}let M=MZ(z),O=kC(z);if(O?.type!=="assistant")throw new Error("Last message was not an assistant message");if(O.message.content.some((u)=>u.type==="text"&&u.text===FW))yield{type:"progress",message:O,normalizedMessages:M,tools:D,parentMessageID:C.message.id,toolUseID:d,isResolved:!1};else{let u=[R===1?"1 tool use":`${R} tool uses`,b11((O.message.usage.cache_creation_input_tokens??0)+(O.message.usage.cache_read_input_tokens??0)+O.message.usage.input_tokens+O.message.usage.output_tokens)+" tokens",kq(Date.now()-F)];yield{type:"progress",message:X3({content:`Done (${u.join(" · ")})`,usage:O.message.usage}),normalizedMessages:M,tools:D,parentMessageID:C.message.id,toolUseID:d,isResolved:!0}}yield{type:"result",data:O.message.content.filter((u)=>u.type==="text")}},isReadOnly(){return!0},async isEnabled(){return!0},userFacingName(){return"Task"},needsPermissions(){return!1},renderResultForAssistant(I){return I},renderToolUseMessage({prompt:I},{verbose:Z}){let G=I.split(lk5);return cM(!Z&&G.length>1?G[0]+"…":I)},renderToolUseRejectedMessage(){return av1.createElement(B6,null)}};var ak5=H1(P1(),1);var pk5=`Restarts ${x2}.`,ik5=`Use this tool to restart ${x2} after making code changes to ${x2} and building them succefully if you next need to test them. The current conversation will be preserved.`;var md6=Z1.object({reason:Z1.string().optional().describe("Optional reason for the restart")});var n91=H1(P1(),1);var nk5=$2(async()=>{let I=[_z,T4,c7,zW,zB,vB,b7,j7,uH,qZ,...[]],Z=await Promise.all(I.map((G)=>G.isEnabled()));return I.filter((G,W)=>Z[W])});async function nv1({permissionMode:I}){return`
- Batch execution tool that runs multiple tool invocations in a single request
- Tools are executed in parallel when possible, and otherwise serially
- Takes a list of tool invocations (tool_name and input pairs)
- Returns the collected results from all invocations
- Use this tool when you need to run multiple independent tool operations at once -- it is awesome for speeding up your workflow, reducing both context usage and latency
- Each tool will respect its own permissions and validation rules
- The tool's outputs are NOT shown to the user; to answer the user's query, you MUST send a message with the results after the tool call completes, otherwise the user will not see the results

Available tools:
${(await Promise.all((await nk5()).map(async(Z)=>`Tool: ${Z.name}
Arguments: ${rk5(Z.inputSchema)}
Usage: ${await Z.prompt({permissionMode:I})}`))).join(`
---`)}

Example usage:
{
  "invocations": [
    {
      "tool_name": "${T4.name}",
      "input": {
        "command": "git blame src/foo.ts"
      }
    },
    {
      "tool_name": "${c7.name}",
      "input": {
        "pattern": "**/*.ts"
      }
    },
    {
      "tool_name": "${zW.name}",
      "input": {
        "pattern": "function",
        "include": "*.ts"
      }
    }
  ]
}
`}function rk5(I){let{properties:Z,required:G=[]}=kK(I);return Object.entries(Z).map(([W,B])=>`${G.includes(W)?"":"[optional] "}${W}: ${B.type} "${B.description}"`).join(", ")}var sk5=Z1.strictObject({description:Z1.string().describe("A short (3-5 word) description of the batch operation"),invocations:Z1.array(Z1.object({tool_name:Z1.string().describe("The name of the tool to invoke"),input:Z1.record(Z1.any()).describe("The input to pass to the tool")})).describe("The list of tool invocations to execute")}),ll2={name:QB,async description(I,{permissionMode:Z}){return await nv1({permissionMode:Z})},userFacingName(){return"Call"},async isEnabled(){return!0},inputSchema:sk5,isReadOnly(){return!0},needsPermissions(){return!1},async prompt({permissionMode:I}){return await nv1({permissionMode:I})},renderToolUseMessage({description:I,invocations:Z},{verbose:G}){return I||`Calling ${Z.length} tools`},renderToolUseRejectedMessage(){return n91.default.createElement(B6,null)},renderToolResultMessage(I){return n91.default.createElement(h,{flexDirection:"column"},n91.default.createElement(m,null,"Completed ",I.length," tool invocations"))},async*call({invocations:I},Z,G,W,B){let w=[],V=I.map((Q,U)=>({id:`mapr_${W.message.id}_${U}`,input:Q.input,name:Q.tool_name,type:"tool_use"})),Y=X3({content:V.map((Q)=>({type:"tool_use",id:Q.id,name:Q.name,input:Q.input}))}),X=MZ([Y]);for(let[Q,U]of X.entries())yield{type:"progress",message:U,normalizedMessages:X,parentMessageID:W.message.id,tools:Z.options.tools,toolUseID:V[Q].id,isResolved:!1};let A=Date.now(),C={},_=0,F=!1;for await(let Q of rE1(V,Y,G,Z,()=>B,!1)){let U=Q.type==="user"&&typeof Q.message.content!=="string"&&Q.message.content[0]?.type==="tool_result"?Q.message.content[0].tool_use_id:Q.type==="progress"?Q.parentToolUseID:void 0;if(!U){r1("tengu_batch_tool_tool_use_id_missing",{});continue}let L=X.find((f)=>f.type==="assistant"&&f.message.content[0]?.type==="tool_use"&&f.message.content[0].id===U);if(!L){r1("tengu_batch_tool_message_missing",{});continue}if(Q.type==="progress"&&Q.message.type==="assistant"){if(C[U]=(Q.message.message.usage.cache_creation_input_tokens??0)+(Q.message.message.usage.cache_read_input_tokens??0)+Q.message.message.usage.input_tokens+Q.message.message.usage.output_tokens,Q.message.message.content[0]?.type==="tool_use")_++}if(yield{type:"progress",message:L,normalizedMessages:X,parentMessageID:W.message.id,tools:Z.options.tools,toolUseID:U,isResolved:Q.type!=="progress"},Q.type==="user"){let f=L.message.content[0],R=f.name,$=`${R}(${Object.entries(f.input).map(([M,O])=>`${M}: ${O}`).join(",")})`;if(typeof Q.message.content!=="string"&&Q.message.content.some((M)=>M.type==="tool_result"&&M.is_error))F=!0;if(Z.options.tools.some((M)=>M.name===R))w.push({key:$,message:Q});else w.push({key:$,message:v5({content:[{type:"tool_result",content:`Error: No such tool available: ${R}`,is_error:!0,tool_use_id:U}]})});if(Z.options.verbose||R===j7.name||R===b7.name)for(let M of MZ([Q]))yield{type:"progress",message:M,normalizedMessages:X,parentMessageID:W.message.id,tools:Z.options.tools,toolUseID:U,isResolved:!0}}}if(Z.abortController.signal.aborted)throw yield{type:"progress",message:X3({content:FW}),normalizedMessages:MZ([Y,...w.map((Q)=>Q.message)]),tools:Z.options.tools,toolUseID:`mapr_${W.message.id}_${I.length}`,parentMessageID:W.message.id,isResolved:!0},new cG;let D=Object.values(C).reduce((Q,U)=>Q+U,0),z=[...D>0?[b11(D)+" tokens"]:[],I.length+_===1?"1 tool use":`${I.length+_} tool uses`,kq(Date.now()-A)];yield{type:"progress",message:X3({content:`Done (${z.join(" · ")})`}),normalizedMessages:MZ([Y,...w.map((Q)=>Q.message)]),tools:Z.options.tools,toolUseID:`mapr_${W.message.id}_${I.length}`,parentMessageID:W.message.id,is