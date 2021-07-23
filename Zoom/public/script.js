const socket = io();
let myVideoStream;
let recordButton=document.querySelector(".inner-record");
let capturePhoto=document.querySelector(".inner-capture")
let recordingState=false;
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
let video=document.getElementsByTagName("video");


let db ;

let dbOpenRequest=indexedDB.open("Gallary",1);

dbOpenRequest.onupgradeneeded=function(e){
    db=e.target.result
    db.createObjectStore("Media",{keyPath:"mid"});
}
dbOpenRequest.onsuccess =function(e){
    db=e.target.result;
}
dbOpenRequest.onerror=function(e){
    alert("Inside on error !");
}
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: 3030,
});

console.log(ROOM_ID);

// Get the video and audio from the browser
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, myVideoStream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
    let text = $("input");

    $("html").keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("SentMessage", text.val());
        text.val("");
      }
    });
    socket.on("createMessage", (message) => {
      $("ul").append(`<li class="messages"><b>User</b><br />${message}</li>`);
      scrollToBottom();
    });
  });

// socket.emit("join-room", ROOM_ID);

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.appendChild(video);
};

const scrollToBottom = () => {
  var d = $(".main__chatWindow");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = '<i class="fas fa-microphone"></i><span>Mute</span>';

  document.querySelector(".Microphone").innerHTML = html;
};

const setUnmuteButton = () => {
  const html =
    '<i class="fas fa-microphone-slash unmute"></i><span>Unmute</span>';

  document.querySelector(".Microphone").innerHTML = html;
};

const muteUnmuteVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setUnmuteVideoButton();
  } else {
    setMuteVideoButton();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteVideoButton = () => {
  const html = '<i class="fas fa-video"></i><span>Stop Video</span>';

  document.querySelector(".VideoCamera").innerHTML = html;
};

const setUnmuteVideoButton = () => {
  const html =
    '<i class="fas fa-video-slash unmute"></i><span>Start Video</span>';

  document.querySelector(".VideoCamera").innerHTML = html;
};







let constraint = { video: true };
let mediaStream= navigator.mediaDevices.getUserMedia(constraint)

    video.srcObject = mediaStream;
    mediaRecorder=new MediaRecorder(mediaStream);
   mediaRecorder.onstart=function(){
  console.log("Inside on start");
   };
   mediaRecorder.ondataavailable = function (e) {
    console.log("Inside on data available");
    console.log(e.data);
    let videoObject = new Blob([e.data], { type: "video/mp4" });

    addMedia(videoObject,"video");
  };
  mediaRecorder.onstop = function () {
    console.log("Inside on stop");
  };
   recordButton.addEventListener("click",function(){
       if(recordingState){
           mediaRecorder.stop();
          //  recordButton.innerHTML="Record Video";
           recordingState=false;
           recordButton.classList.remove("animate-record")
       }else{
        mediaRecorder.start();
        // recordButton.innerHTML="Recording";
        recordingState=true;
        recordButton.classList.add("animate-record")
       }
   })
     capturePhoto.addEventListener("click",function(){
      capturePhoto.classList.add("animate-capture"); 
      setTimeout(function(){
   capturePhoto.classList.remove("animate-capture");
      },1000)

      let canvas =document.createElement("canvas");
         canvas.width=640;
         canvas.height=480;
         let ctx=canvas.getContext("2d");
         if(currentZoom!=1){
           ctx.translate(canvas.width/2,canvas.height/2);
           ctx.scale(currentZoom,currentZoom);
           ctx.translate(-canvas.width/2,-canvas.height/2);
         }
     ctx.drawImage(videoElement,0,0);
       
     if (filterSelected != "none") {
      ctx.fillStyle = filterSelected;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    

  let canvasURL=canvas.toDataURL("image.jpg");
  addMedia(canvasURL,"photo");

        })




        function addMedia(mediaURL,mediaType){
          let txnObject=db.transaction("Media","readwrite");
          let mediaTable=txnObject.objectStore("Media");
        
          mediaTable.add({mid:Date.now(),type:mediaType,url:mediaURL});
        console.log(txnObject);
          txnObject.onerror=function(e){
            console.log(e);
          }
        }