//////const { log } = require('console');

const express = require('express');
const FileSystem = require('fs');
const path = require("path");
const multer = require('multer');
const bodyParser = require('body-parser');
const {Server} = require('socket.io');
const http = require('http');

const upload = multer({ dest: 'uploads/' });

const rootDirectoryPath = path.join(__dirname, '../drive');
const uploadFolderPath = path.join(__dirname, '../', '/uploads');

const app = express();
const httpServer = http.Server(app);

app.set("view engine", "ejs");

httpServer.listen(80);

app.use(bodyParser.urlencoded({ extended: true }));
//console.log(path.join(__dirname, "../public"));
app.use(express.static(path.join(__dirname, "../public")));

const io = new Server(httpServer, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
    },
  });

let posts;
let fileList = [];
let directoryList = [];
let DirectoryFilesList = [];

let currentDirectory = rootDirectoryPath;

io.on("connection", async (socket) => {

    socket.on("req/user/select", async({name}) => {

        if(name == "" || name == "..."){
            if(name == ""){
                currentDirectory = rootDirectoryPath;
            }else{
                currentDirectory = path.join(currentDirectory,"../");
                currentDirectory = currentDirectory.substr(0, currentDirectory.length - 1);
            }    
            getDirectoryFilesList(currentDirectory); 
            socket.emit("res/user/select", {status: "success", result: {directoryList: directoryList, fileList: fileList} });  
        }else{
            let fullPath = path.join(currentDirectory, "/", name);
            if (FileSystem.existsSync(fullPath)) {
                if(FileSystem.lstatSync(fullPath).isFile()){
                    //res.download(fullPath);

                    let fileData = FileSystem.readFileSync(fullPath);

                    //console.log(fileData);

                    socket.emit("res/user/download", {status:"success", result:{fileData: fileData, fileName: name}});
                }
                else{
                    currentDirectory = fullPath;
                    getDirectoryFilesList(currentDirectory);  
                    socket.emit("res/user/select", {status: "success", result: {directoryList: directoryList, fileList: fileList} }); 
                }
            }            
        }         
    });       
  
    socket.on("req/user/newFile", async({name}) => {
        if (FileSystem.existsSync(path.join(currentDirectory, "/", name)) == false) {
            FileSystem.mkdirSync(path.join(currentDirectory, "/", name));
        }   
        getDirectoryFilesList(currentDirectory);  
        socket.emit("res/user/newFile", {status: "success", result: {directoryList: directoryList, fileList: fileList} }); 
    }); 
    
    socket.on("req/user/loadFile", async({file, fileName}) => {

        FileSystem.writeFileSync(path.join(currentDirectory, "/", fileName), file);

        getDirectoryFilesList(currentDirectory);  
        socket.emit("res/user/newFile", {status: "success", result: {directoryList: directoryList, fileList: fileList} }); 
    }); 

});

function CalculateResault() {
    posts = "sdsds";
}

function replaceFile(originfilename, fileName, destination) {
    FileSystem.renameSync(path.join(uploadFolderPath, "/", fileName),
        path.join(destination, "/", originfilename));
}

function createDirectory(currentDirectory, folderName) {

}

function getDirectoryFilesList(currentDirectory) {
    directoryList = [];
    fileList = [];

    DirectoryFilesList = FileSystem.readdirSync(currentDirectory);

    let currentFilePath;
    let length = rootDirectoryPath.length;

    if (currentDirectory != rootDirectoryPath){
        directoryList.push({name: "...", path: ""});
    }

    DirectoryFilesList.forEach(function(fileName) {
        currentFilePath = path.join(currentDirectory, "/", fileName);
        if (FileSystem.lstatSync(currentFilePath).isDirectory() == true) {

            directoryList.push({ name: fileName, path: currentFilePath.substr(length) });

        } else {
            fileList.push({ name: fileName, path: currentFilePath.substr(length) });
        }
    });
}