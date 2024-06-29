// client.js

const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');
const hangupButton = document.getElementById('hangupButton');

let localStream;
let peerConnection;

console.log('Client connected to server via Socket.IO');

startButton.addEventListener('click', async () => {
    console.log('Start button clicked');
    
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        peerConnection = new RTCPeerConnection();

        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log('Sending ICE candidate to peer:', event.candidate);
                socket.emit('icecandidate', event.candidate);
            }
        };

        peerConnection.ontrack = event => {
            console.log('Received remote stream');
            remoteVideo.srcObject = event.streams[0];
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        console.log('Sending offer to peer:', offer);
        socket.emit('offer', offer);
    } catch (error) {
        console.error('Error starting call:', error);
    }
});

socket.on('offer', async offer => {
    try {
        console.log('Received offer from remote peer:', offer);

        await peerConnection.setRemoteDescription(offer);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log('Sending answer to remote peer:', answer);
        socket.emit('answer', answer);
    } catch (error) {
        console.error('Error handling offer:', error);
    }
});

socket.on('answer', async answer => {
    try {
        console.log('Received answer from remote peer:', answer);
        await peerConnection.setRemoteDescription(answer);
    } catch (error) {
        console.error('Error handling answer:', error);
    }
});

socket.on('icecandidate', async candidate => {
    try {
        console.log('Received ICE candidate from remote peer:', candidate);
        await peerConnection.addIceCandidate(candidate);
    } catch (error) {
        console.error('Error handling ICE candidate:', error);
    }
});

hangupButton.addEventListener('click', () => {
    console.log('Hangup button clicked');
    localStream.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;

    if (peerConnection) {
        peerConnection.close();
    }

    socket.emit('hangup');
});
