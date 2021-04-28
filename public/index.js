const serverURL = "http://localhost:80/";

const newSocket = io(serverURL);
newSocket.on("res/user/select", ({status, result}) => {
    if (status == "success")
    {
        drawFileList(result);
    }
});
newSocket.on("res/user/download", ({status, result}) => {
    if (status == "success")
    {
        downloadFile(result.fileData, result.fileName);
    }
});
newSocket.on("res/user/newFile", ({status, result}) => {
    if (status == "success")
    {
        drawFileList(result);
    }
});
newSocket.on("res/user/loadFile", ({status, result}) => {
    if (status == "success")
    {
        drawFileList(result);
    }
});

const formAddFile = document.getElementById('formAddFile');
formAddFile.onsubmit = async function(event) {
    event.preventDefault();

    newSocket.emit("req/user/newFile", {name: event.target.NameOfFile.value});
}

const formUpload = document.getElementById('formUploadFile');
formUpload.onsubmit = async function(event) {
    event.preventDefault();

    newSocket.emit("req/user/loadFile", {file: document.getElementById('fileToUpload').files[0], fileName: document.getElementById('fileToUpload').files[0].name});    
}

window.onload = async function() {

    selectFile("");

    
    document.getElementById('body').onclick = function(event) {
            let target = event.target.closest(".FilePanel");

            if (target?.tagName == "DIV") {

                selectFile(target['dataset'].name);
            }
        }
}

function drawFileList(fileList){

    document.getElementById('fileTable').innerHTML = "";

    let fileListHTML = fileList.directoryList.reduce((acc, e) => {
        acc = acc +
            `<div data-name="${e.name}" class="FilePanel">
                <img src="/images/folder.png" class="FileImage">
                <p class="FileName">
                    ${e.name}
                </p>
            </div>`;
        return acc;
    }, "");

    fileListHTML = fileListHTML + fileList.fileList.reduce((acc, e) => {
        acc = acc +   
        `<div data-name="${e.name}" class="FilePanel">
            <img src="/images/file.png" class="FileImage">
            <p class="FileName">
                ${e.name}
            </p>
        </div>`   
        return acc;
    }, "");

    document.getElementById('fileTable').innerHTML = document.getElementById('fileTable').innerHTML + fileListHTML;
}

async function selectFile(name){    
    newSocket.emit("req/user/select", {name: name});
}

var downloadFile = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return (fileData, fileName) => {
        var json = fileData, 
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

