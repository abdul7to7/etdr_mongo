const server = "https://etdr-mongo-backend.onrender.com";

document.getElementById("signUpForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signUpUsername").value;
  const mail = document.getElementById("signUpMail").value;
  const password = document.getElementById("signUpPassword").value;

  [...document.getElementsByClassName("btn")].forEach((btn) => {
    btn.setAttribute("disabled", true);
  });

  fetch(`${server}/user/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      mail: mail,
      password: password,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      if (response.suceess == false) {
        window.location.reload();
        //send msg here
        return;
      }
      alert("register successful");
      localStorage.setItem("token", response.token);
      window.location.href = "./expenseForm.html";
    })
    .catch((e) => {
      alert(e);
    });

  [...document.getElementsByClassName("btn")].forEach((btn) => {
    btn.removeAttribute("disabled");
  });
});
