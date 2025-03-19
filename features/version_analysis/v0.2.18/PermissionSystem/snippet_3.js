put: Shows working tree status

          Input: npm install
          Output: Installs package dependencies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`});return(d.message.content[0]?.type==="text"?d.message.content[0].text:null)||"Executes a bash command"}catch(d){return C0(d),"Executes a bash command"}},async prompt(){return Iz2},isReadOnly(){return!1},inputSchema:Yu,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let d=PR(I);for(let G of d){let Z=G.split(" "),W=Z[0];if(W&&rg1.includes(W.toLowerCase()))return{result:!1,message:`Command '${W}' is not allowed for security reasons`};if(W==="cd"&&Z[1]){let w=Z[1].replace(/^['"]|['"]$/g,""),B=dz2(w)?w:Zz2(E0(),w);if(!hx(Gz2(II(),B),Gz2(E0(),II())))return{result:!1,message:`ERROR: cd to '${B}' was blocked. For security, ${K4} may only change directories to child directories of the original working di