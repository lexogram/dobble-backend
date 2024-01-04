const disconnector = document.querySelector(".disconnect button")
disconnector.addEventListener("click", disconnect)

function disconnect() {
  socket.close()
}