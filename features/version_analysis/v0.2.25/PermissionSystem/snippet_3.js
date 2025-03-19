put: Shows working tree status

          Input: npm install
          Output: Installs package dependencies

          Input: mkdir foo
          Output: Creates directory 'foo'`],userPrompt:`Describe this command: ${I}`});return(G.message.content[0]?.type==="text"?G.message.content[0].text:null)||"Executes a bash command"}catch(G){return A0(G),"Executes a bash command"}},async prompt(){return yz2},isReadOnly(){return!1},inputSchema:RO,userFacingName(){return"Bash"},async isEnabled(){return!0},needsPermissions(){return!0},async validateInput({command:I}){let G=cU(I);for(let Z of G){let d=Z.split(" "),W=d[0];if(W&&_g1.includes(W.toLowerCase()))return{result:!1,message:`Command '${W}' is not allowed for security reasons`};if(W==="cd"&&d[1]){let B=d[1].replace(/^['"]|['"]$/g,""),w=Pz2(B)?B:Tz2(E0(),B);if(!ox(Oz2(dI(),w),Oz2(E0(),dI())))return{result:!1,message:`ERROR: cd to '${w}' was blocked. For security, ${X4} may only change directories to child directories of the original working di