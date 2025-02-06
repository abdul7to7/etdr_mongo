const server = "https://etdr-mongo-backend.onrender.com";

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const mail = document.getElementById("loginMail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    document.getElementsByClassName("btn").forEach((btn) => {
      btn.setAttribute("disable");
    });
    const response = await axios.post(`${server}/user/login`, {
      mail: mail,
      password: password,
    });
    if (response && response.data && response.data.success) {
      localStorage.setItem("token", response.data.token);
      window.location.href = "./expenseForm.html";
    } else {
      alert(`Something went wrong`);
    }
  } catch (e) {
    alert(`Something went wrong: ${e.message}`);
  }
  document.getElementsByClassName("btn").forEach((btn) => {
    btn.removeAttribute("disable");
  });
});

document.getElementById("forgot-password").addEventListener("click", () => {
  document.getElementById("forgot-password-form").style.display = "block";
});

document
  .getElementById("forgot-password-form")
  ?.addEventListener("submit", (e) => {
    e.preventDefault();
    const mail = document.getElementById("forgot-password-mail").value;
    fetch(`${server}/user/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mail: mail,
      }),
    });
  });
