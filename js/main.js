async function getGithubRepo() {
  const data = await fetch(
    "https://api.github.com/users/WilliamFelix168/repos"
  ).then((response) => response.json());
  updateUI(data);
}

function updateUI(card) {
  let cards = "";
  card.forEach((element) => {
    cards += showCards(element);
  });

  const container = document.querySelector(".repo-container");
  container.innerHTML = cards;
}

function showCards(card) {
  return `<div class="col-md-3 mb-2">
              <div class="card post animate__animated animate__zoomIn my-2">
              <div class="card-body">
                  <div class="text text-center post-title">
                    <p class="fw-bold">${card.name} (${card.language})</p>
                  </div>
                  <p class="language m-0 post-title">Updated : ${formatDate(card.updated_at)}</p>
                  <p class="card-text post-title">${
                    card.description ? card.description : "No Description"
                  }</p>
                 
                  <div class="d-grid gap-2 post-title mb-2">
                    <a href="${card.html_url}" class="btn btn-primary" target="blank">Detail</a>
                  </div>
                </div>
              </div>
            </div>`;
}

function formatDate(date){
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'June',
    'July',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  const d = new Date(date)
  const year = d.getFullYear()
  const newDate = d.getDate()
  const monthIndex = d.getMonth()
  const monthName = months[monthIndex]

  return `${monthName} ${newDate}, ${year}`
}
