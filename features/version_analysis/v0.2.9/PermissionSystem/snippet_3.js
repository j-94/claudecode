put: Shows working tree status

          Input: npm install
          Output: Installs package dependencies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`});return(d.message.content[0]?.type==="text"?d.message.content[0].text:null)||"Executes a bash command"}catch(d){return X0(d),"Executes a bash command"}},async prompt(){return lK2},isReadOnly(){return!1},inputSchema:o$,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let d=NR(I);for(let G of d){let Z=G.split(" "),C=Z[0];if(C&&DJ1.includes(C.toLowerCase()))return{result:!1,message:`Command '${C}' is not allowed for security reasons`};if(C==="cd"&&Z[1]){let W=Z[1].replace(/^['"]|['"]$/g,""),w=bK2(W)?W:jK2(R0(),W);if(!x81(hK2(t7(),w),hK2(R0(),t7())))return{result:!1,message:`ERROR: cd to '${w}' was blocked. For security, ${K4} may only change directories to child directories of the original working d