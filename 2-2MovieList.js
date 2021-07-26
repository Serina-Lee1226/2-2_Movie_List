// 為了方便區分哪些是常數那寫是變數，我們可以把常數在宣告的時候用大寫來表示!
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const IMAGE_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12 //希望每個分頁有12筆電影資料

const movies = []
let filteredMovies = [] // 從 addEventListener : onSearchFormSubmit 中取過來放這邊
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
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
                <button class="btn btn-info btn-add-favorite" data-id='${item.id}'>
                  Add
                </button>
              </div>
            </div>
        </div>
        `
  })
  dataPanel.innerHTML = content
}

axios
  .get(INDEX_URL)
  .then(response => {
    // 方法三：展開運算子(...)
    movies.push(...response.data.results)
    // 方法一：for~of
    // for (let movie of response.data.results){
    //   movies.push(movie)
    // }
    // 方法二：forEach
    // response.data.results.forEach(movie =>{
    //   movies.push(movie)
    // })
    renderMovie(getMoviesByPage(1)) //原本帶入整個movies，現在只呈現「分頁資料」，第一頁就從1開始
    paginatorPage(movies.length) //在這裡呼叫，movies的length會是80筆
  })
  .catch(error => {
    console.log(error);
  })

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

function addToFavorite(id) {
  // console.log(id)
  // 第一步：挑出目標物件資料(按到Add按鈕的那一筆id，再從原資料中find出來)
  const pickMovie = movies.find((movie) => movie.id === id)
  // console.log(movie)
  // 在80筆原始資料(movies)中，找出第一個與btn add物件id相同的物件抓出來，儲存在pickMovie中

  // 第二步：抓取儲存在 localStorage 的資料(by getItem)，若無則回傳空陣列
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //JSON.parse：將程式碼轉回「JS」格式，將儲存在 favoriteMovies 的資料(陣列儲存)抓出來
  
  // 第五步：補上重複機制，位置一定要放在list.push前!!!!
  if (list.some((movie) => movie.id === id)) { //注意不能寫：物件===物件(movie=>movie === pickMovie )
    // console.log(typeof(list[0].id))  // 注意： object 中 id 的 value 是 number，所以跟他比較的右邊那個 id 也必須要為 number!
    return alert('此電影已經在收藏清單中！') //記得打 「return」
    // 如果 list中有任何物件與「欲新增」的物件相同，則出現警告！並不會重複加進list中。
  }

  // 第三步：將目標物件儲存到 list 中
  list.push(pickMovie)
  // console.log(list)
  // 第四步：將 list 儲存到 localStorage 中
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// More 點擊 跳出 Modal:這時才藉由function:showMovieModal 去改 HTML 裡面的內容
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // console.log(event.target.dataset)
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id) // 參數id為字串形式
  } else if (event.target.matches('.btn-add-favorite')) {  // 按到「加到收藏清單」按妞
    addToFavorite(Number(event.target.dataset.id)) // 記得在add btn中新增一個attribute:「data-id='${item.id}'」

  }

})

searchForm.addEventListener('submit', function onSearchFormSubmit(event) {
  event.preventDefault() // 我沒有這行好像也沒有出現重整頁面
  // console.log(searchInput.value) // 可將使用者的input印出來
  const input = searchInput.value.toLowerCase().trim()
  // trim可以將多餘空白去掉，一定要加，這樣當只有輸入空白鍵時，才會偵測到！

  // if (!input.length){ 
  //input.length若為0則為false，加上!變成true，則會執行下面程式碼。
  //   return alert('請輸入關鍵字！')
  // }
  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(input) // 箭頭函式內容只有一行，不要用「大括號」，否則跑不出來
  )// filter：會將true的內容篩選出來，並產生一個新陣列儲存
  // 方法一：for...of
  // let filteredMovies = []
  // for (const movie of movies){
  //   if (movie.title.toLowerCase().includes(input)){ // 了解一下 includes 用法
  //     filteredMovies.push(movie)
  //   }
  // }
  // filter map reduce 陣列操作三寶，請了解。
  if (filteredMovies.length === 0) {
    return alert('請重新輸入關鍵字！') // 了解一下 alert的用法
  }// 不用上面 if-alert 是希望:當輸入「亂七八糟關鍵字、空白鍵」時，就呈現「全部電影清單」
  
  paginatorPage(filteredMovies.length) // paginator頁數由此製造
  renderMovie(getMoviesByPage(1)) // search 完先render出第一頁，多的資料後面頁數由「點案按鈕時的 addEventListener: onPaginatorClicked 來製作，因為裡面也有getMoviesByPage函數，所以每頁也頂多呈現12筆資料。
})

//TODO:新東西
// localStorage.setItem('a','b')
// localStorage.setItem('a', 'c')
// console.log(localStorage.getItem('default_language'))

function getMoviesByPage(page){ //期望輸入「某頁」，就傳出「該頁對應的電影資料最多12筆」
  // page 1 movies 0~11
  // page 2 movies 12~23
  // page 3 movies 24~35 
  // 分頁呈現內容有兩種： movies / filteredMovies
  const data = filteredMovies.length ? filteredMovies : movies
  // 上面意思： 若 filteredMovies.length 有東西：給我 filteredMovies，沒東西：給我 movies
  const startIndex = (page-1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function paginatorPage(moviesAmount) {  // 由總資料(movies.length帶入)計算出總共需要「幾個分頁」，就render出幾個分頁html
  // amount = 80，80/12=6...8=7(無條件進位：用Math.ceil)
  pageAmount = Math.ceil(moviesAmount / MOVIES_PER_PAGE)
  let content =''
  for (let page = 0 ; page < pageAmount ; page++){
    content += `<li class="page-item"><a class="page-link" href="#" data-page='${page + 1}'>${page + 1}</a></li>`
  }// 忘記：data-page='${page+1}' 要記得用「引號」刮起來，才會包含進 dataset 裡面！
  paginator.innerHTML = content
}

paginator.addEventListener('click',function onPaginatorClicked(event){
  // console.log(event.target.tagName) // 'A' = <a></a> 標籤a
  if (event.target.tagName !== 'A') return  // 如果點擊到的東西不是a標籤，則直接跳出這個function
  // console.log(event.target.dataset.page) 
  // 呼叫data-page時，不是寫...dataset.data-page
  let page = Number(event.target.dataset.page)
  renderMovie(getMoviesByPage(page))
})