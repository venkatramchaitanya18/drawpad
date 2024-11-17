let canvas = document.querySelector("#board");

let toolbar = document.querySelector(".toolbar");

let colorBoxes = document.querySelectorAll(".color-box");
let sizeSelector = document.querySelector("#sizeSelector");
let colordiv = document.querySelector('#colorPalette');
let colors=false;
colordiv.style.display = 'none';
colordiv.style.position = 'absolute';


let tool = canvas.getContext("2d");


let toolsArray = document.querySelectorAll(".tool");
let currentTool = "pencil";
for(let i=0;i<toolsArray.length;i++){
    toolsArray[i].addEventListener("click",function(){
        const toolName = toolsArray[i].id;
        if(toolName == "pencil"){
            currentTool = "pencil";
            if(colors==false){
                colordiv.style.display="none";
                colors=!colors;
            }
            else{
                colordiv.style.display="block";
                colors=!colors;
            }
        }
        else if(toolName == "eraser"){
            currentTool = "eraser";
            tool.strokeStyle = "white";
            
        }
        else if(toolName == 'sticky'){
            currentTool = "sticky";
            createSticky();
        }
        else if(toolName == 'upload'){
            currentTool = "upload";
            uploadFile();
        }
        else if(toolName == 'download'){
            currentTool = 'download';
            downloadFile();
        }
        else if(toolName == 'undo'){
            currentTool = 'undo';
            undoFunc()
        }
        else if(toolName == 'redo'){
            currentTool = 'redo';
            redoFunc() 
        }

    })
}


function getYdelta(){
   let toolheight = toolbar.getBoundingClientRect().height;
   console.log(toolheight)
   return toolheight;
}





canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Set initial tool properties

tool.lineWidth = sizeSelector.value;

colorBoxes.forEach(box => {
    box.addEventListener("click", function() {
        let selectedColor = this.getAttribute("data-color");
        
            
        if (currentTool === "pencil") {
            tool.strokeStyle = selectedColor;
            colordiv.style.display = "none";
            colors = false;
        }
        // Update active color box
        document.querySelector(".color-box.active")?.classList.remove("active");
        this.classList.add("active");
    });
});



sizeSelector.addEventListener("change", function() {
    tool.lineWidth = this.value;
});

let undoStack = [];
let redoStack = [];

let isdraw = false;

/************  Pencil Implimentation **********/
canvas.addEventListener("mousedown",function(e){
    let sidx = e.clientX;
    let sidy = e.clientY;
    let toolheight = getYdelta();
    tool.beginPath();
    tool.moveTo(sidx,sidy-toolheight);
    isdraw = true;
    let pointDesc = {
        x : sidx,
        y : sidy-toolheight,
        desc : "md",
        color:tool.strokeStyle,
        width:tool.lineWidth
    }

    undoStack.push(pointDesc);
});


canvas.addEventListener("mousemove",function (e){
    let midx = e.clientX;
    let midy = e.clientY;
    if(isdraw){
        let toolheight = getYdelta();
        tool.lineTo(midx,midy-toolheight);
        tool.stroke();

        let pointDesc = {
            x : midx,
            y : midy-toolheight,
            desc : "mm",
            color:tool.strokeStyle,
            width:tool.lineWidth
        }
        undoStack.push(pointDesc);

    }

    
    

});

canvas.addEventListener("mouseup",function(e){
    isdraw = false;
    console.log(undoStack)
    
});



/**********  Create Sticky *************/
function createOuterShell(){
    let stickyDiv = document.createElement("div");
    let navDiv = document.createElement("div");
    let closeDiv = document.createElement("div");
    let minimizeDiv = document.createElement("div");

    stickyDiv.setAttribute("class","sticky");
    navDiv.setAttribute("class","nav");
    closeDiv.setAttribute("class","close");
    minimizeDiv.setAttribute("class","minimize");

    stickyDiv.style.height = "11rem";
    stickyDiv.style.width = "11rem";
    stickyDiv.style.top = "300px";
    stickyDiv.style.left = "400px";
    stickyDiv.style.position = "absolute";

    closeDiv.innerHTML='❌';
    minimizeDiv.innerHTML='➖';

    stickyDiv.appendChild(navDiv);
    navDiv.appendChild(minimizeDiv);
    navDiv.appendChild(closeDiv);

    document.body.appendChild(stickyDiv);

   
    closeDiv.addEventListener("click",function (){
        stickyDiv.remove();
    })

    let isminimised = false;
    minimizeDiv.addEventListener("click",function (){
        textArea.style.display= isminimised==true ? 'block' : 'none';
        isminimised = !isminimised;
    })

/***************** Sticky Movement***********************/

    let isstickymove = false;
    let startidx, startidy;
    navDiv.addEventListener("mousedown",function(e){
        startidx = e.clientX;
        startidy = e.clientY;
        isstickymove = true;
        document.body.style.cursor='move';
    });
       
    document.addEventListener("mousemove",function (e){
        if(isstickymove == true){
            //final point
            let finalx = e.clientX;
            let finaly = e.clientY;

            console.log(finalx,finaly)
            
            //distance
            let dx = finalx-startidx;
            let dy = finaly-startidy;
            //move sticky
            let {top,left} = stickyDiv.getBoundingClientRect();
        
            stickyDiv.style.top = top + dy + "px";
            stickyDiv.style.left = left + dx + "px";
            startidx = finalx;
            startidy = finaly;
        }
    
    });

    document.addEventListener("mouseup",function(){
        isstickymove = false;
    });
    navDiv.addEventListener("mouseleave", function() {
        isStickyDown = false;
        document.body.style.cursor = 'default';
      });
      document.body.appendChild(stickyDiv);
      return stickyDiv;

}





function createSticky(){
    let stickyDiv = createOuterShell();
    let textArea = document.createElement("textarea");
    textArea.setAttribute("class","textarea");
    stickyDiv.appendChild(textArea);
    return textArea;
}



/**********************Upload File****************************/




let inputtag = document.querySelector('.input-tag');
function uploadFile(){
    inputtag.click();
    inputtag.addEventListener("change",function(){
        let file = inputtag.files[0];
        let img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.setAttribute('class',"upload-img");
        let stickyDiv = createOuterShell();
        stickyDiv.appendChild(img);

    })
}




/*********************Download File******************************/


function downloadFile(){
    html2canvas(document.body).then(function (canvas) {
        let a = document.createElement("a");
        a.download = "file.jpeg";
        let url = canvas.toDataURL("image/jpeg");
        a.href = url;
        a.click();
        a.remove();
    });
}



/**************************Undo Code*************************************/

function undoFunc(){
   const color = undoStack[0].color;
    
        if(undoStack.length > 0){
            tool.clearRect(0,0,canvas.width,canvas.height);
        
            redoStack.push(undoStack.pop());
            for(let i=0;i<undoStack.length;i++){
                let {x,y,desc,width,color} = undoStack[i];
                if(desc == "md"){
                    tool.lineWidth=width;
                    tool.strokeStyle=color;
                    tool.beginPath();
                    tool.moveTo(x,y);
                }
                else if(desc == "mm"){
                    tool.lineTo(x,y);
                    tool.stroke();
                }
            }
        }
    return true;
}




document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'z') {
        event.preventDefault(); 
        undoFunc()
        
    }
});







/**************************Redo Code*************************************/

function redoFunc(){
    if(redoStack.length > 0){
        tool.clearRect(0,0,canvas.width,canvas.height);
        undoStack.push(redoStack.pop());
        for(let i=0;i<undoStack.length;i++){
            let {x,y,desc,width,color} = undoStack[i];
            if(desc == "md"){
                tool.strokeStyle=color;                
                tool.lineWidth=width;
                tool.beginPath();
                tool.moveTo(x,y);
            }
            else if(desc == "mm"){
                tool.lineTo(x,y);
                tool.stroke();
            }
        }    
    }
}


document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'y') {
        event.preventDefault(); 
        redoFunc()
    }
});






