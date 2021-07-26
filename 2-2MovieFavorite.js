// 為了方便區分哪些是常數那寫是變數，我們可以把常數在宣告的時候用大寫來表示!
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const IMAGE_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
// const 代表你不能用 movies = response.data.results 這種簡單的等號賦值來把資料放進變數裡，要用 push！
// 那為何不用let就好？ let movies = response.data.results
// 因為我們不想要更動 movie 中的原始資料！

function renderMovie(movie) {
  let content = ''
  movie.forEach(item => {
    // image、title
    // image引入注意：src="${}" 要有“”刮在外面
    // 注意：content 「+=」 
    // function 無需 return 也沒關係！這韓式的功效就是將內容寫入dataPanel！
    content += `
        <div class="col-sm-3 mb-2">
            <div class="card">
              <img src="${IMAGE_URL + item.image}" class="card-img-top"
                alt="Movie Pic">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id='${item.id}'>More</button>
                <button class="btn btn-danger btn-delete-movie" data-id='${item.id}'>
                  Delete
                </button>
              </div>
            </div>
        </div>
        `
  })
  dataPanel.innerHTML = content
}


renderMovie(movies)


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    // 因為 get 特定 id 的內容，response 是回傳單一電影詳細資料
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release Date：' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
    <img src="${IMAGE_URL + data.image}" alt="modal-image" class='img-fluid'>
    `
    // console.log(data)
  })
}

function deleteIndex(id){
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return // 多加錯誤機制（找不到index時，會回傳-1）
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies)) //忘記要打這行，直接在函示中重新render Movie只能修改一時！重新整理後又回到原樣！因為localStorage沒有被改變到！
  renderMovie(movies) //但這行也不能少！刪除當下才會在畫面刪除，不然就只有Storage改變，重新整理後畫面才改變！
}

// More 點擊 跳出 Modal:這時才藉由function:showMovieModal 去改 HTML 裡面的內容
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // console.log(event.target.dataset)
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id) // 參數id為字串形式
  } else if (event.target.matches('.btn-delete-movie')){
    deleteIndex(Number(event.target.dataset.id))
  }
  // else if (event.target.matches('.btn-add-favorite')) {  // 按到「加到收藏清單」按妞
  //   addToFavorite(Number(event.target.dataset.id)) // 記得在add btn中新增一個attribute:「data-id='${item.id}'」

  // }

})

