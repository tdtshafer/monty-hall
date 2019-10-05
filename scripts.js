window.onload = function() {

    document.getElementById('door_one').addEventListener('click', function (e) {
      var img = document.createElement('img');
      img.setAttribute('src', 'door_one_open.png');
      e.target.appendChild(img);
    });
  
  };

function openDoor(x){
    console.log(x)
}