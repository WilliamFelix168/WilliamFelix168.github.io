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
              <div class="card post">
                <div class="card-header text text-center post-title">
                  ${card.name} (${card.language})
                  <p class="language m-0 text-end mt-2">Updated : ${formatDate(card.updated_at)}</p>
                </div>
                <div class="card-body">
                  <p class="card-text post-title">${
                    card.description ? card.description : "No description"
                  }</p>
                  <div class="text-center post-title mb-2">
                    <a href="${card.html_url}" class="btn btn-primary">Detail</a>
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