put: Shows working tree status

          Input: npm install
          Output: Installs package dependencies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`});return(G.message.content[0]?.type==="text"?G.message.content[0].text:null)||"Executes a bash command"}catch(G){return Z0(G),"Executes a bash command"}},async prompt(){return VQ2},isReadOnly(){return!1},inputSchema:yO,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let G=oR(I);for(let Z of G){let d=Z.split(" "),W=d[0];if(W&&$g1.includes(W.toLowerCase()))return{result:!1,message:`Command '${W}' is not allowed for security reasons`};if(W==="cd"&&d[1]){let B=d[1].replace(/^['"]|['"]$/g,""),w=AQ2(B)?B:YQ2(U0(),B);if(!Xc(XQ2(VI(),w),XQ2(U0(),VI())))return{result:!1,message:`ERROR: cd to '${w}' was blocked. For security, ${l2} may only change directories to child directories of the original working di