const fs=require("fs");
const { exit } = require("process");
const { arrayBuffer } = require("stream/consumers");

var args = process.argv.slice(2);

if(args.length==0){console.error("usage: [inputfile] [outputfile]");exit(1)};

let input=fs.readFileSync(args[0]).toString();
let optimize = args[2]=="--optimize";
let lines=input.trim().split("\n");

let outputString="";
let outputLines=[];

if(!optimize){console.log("warning: running in unoptimized mode. consider using --optimize")};

let containerOpen=false;
let containerName="";
let burnt=false;
let closedContainers=[];
let currentText=optimize?"":[];
let usedPages=[];
let notebookPages=[];

for(let i=0;i<lines.length;i++){

    let line = lines[i].trim();
    tokens=line.split(" ");
    
    let instruction=tokens[0];
    
    switch(instruction){
        case "find":
        if(containerOpen){console.error("error: current container has to be closed first, line "+i);exit(1)};
        if(tokens[1]==null){console.error("error: must specify container name, line "+i);exit(1)};
        if(closedContainers.includes(tokens[1])){console.error("error: container already burnt, line "+i);exit(1)};
        containerName=tokens[1];
        burnt=false;
        if(!optimize){outputLines.push("set container "+tokens[1]);}
        //find container
        break;
        case "open":
        if(containerOpen){console.error("error: container already open, line "+i);exit(1)};
        if(tokens[1]!=containerName){console.error("error: trying to open different container, line "+i);exit(1)};
        if(closedContainers.includes(tokens[1])){console.error("error: cannot re-open this container, line "+i);exit(1)};
        containerOpen=true;
        //open container
        break;
        case "write":
        page=parseInt(tokens[1]);
        if(Number.isNaN(page)){console.error("error: notebook page must be a number, line "+i);exit(1)};
        if(usedPages.includes(page)){console.error("error: page does not exist anymore, line "+i);exit(1)};
        
        if(notebookPages[page]==null){notebookPages[page]=[]};
        notebookPages[page].push(tokens.slice(2).join(" "))
        //write to page
        break;
        case "toss":
        page=parseInt(tokens[1]);
        if(Number.isNaN(page)){console.error("error: notebook page must be a number, line "+i);exit(1)};
        if(containerName!=tokens[2]){console.error("error: you are in another container, line "+i);exit(1)};
        if(usedPages.includes(page)){console.error("error: notebook page doesnt exist, line "+i);exit(1)};
        if(!containerOpen){console.error("error: cannot toss into a closed container, line "+i);exit(1)};
        if(burnt){console.error("error: cannot toss into burnt container, line "+i);exit(1)};
        usedPages.push(page);
        if(optimize){currentText+=notebookPages[page].join(" ")+"\\n";}else{notebookPages[page].forEach(p=>{currentText.push(p)})};
        //toss page
        break;
        case "burn":
        if(containerName!=tokens[1]){console.error("error: trying to burn another container, line "+i);exit(1)};
        if(!containerOpen){console.error("error: cannot burn closed container, line "+i);exit(1)};
        if(burnt){console.error("error: container already burnt, line "+i);exit(1)};
        burnt=true;
        //print thing
        if(optimize){outputLines.push(`print "${currentText}"`);}else{currentText.forEach(t=>{outputLines.push(`print "${t}\\n"`)})}
        currentText=optimize?"":[];
        break;
        case "close":
        if(containerName!=tokens[1]){console.log("error: cannot close this container, line "+i);exit(1)};
        if(!containerOpen){console.log("error: cannot close a closed container, line "+i);exit(1)};
        if(!burnt){console.log("error: trying to close un-burnt container, line "+i);exit(1)};
        containerOpen=false;
        closedContainers.push(containerName);
        //printflush
        
        outputLines.push("printflush "+(optimize?containerName:"container"));
        break;
    }
}
if(!burnt){console.error("error: not all containers are burnt");exit(1)}; //check if all containers are closed
if(containerOpen){console.error("error: not all containers are closed (unexpected end of input)");exit(1)}; //check if all containers are closed
console.log(outputLines.join("\n"));
fs.writeFileSync(args[1],outputLines.join("\n"));
exit(0);