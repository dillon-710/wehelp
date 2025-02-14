import './styles.css'
// 怕重複再存一次變數
const stationId = 'index';
const inoption = document.getElementById(stationId); // Get the element by stored id
fetch('http://118.163.34.119:8088/api/StationNumber/read')
.then( response => {
  if(!response.ok)throw new Error(`Http: ${response.status}`)
    return response.json()
})
.then(data => {
  console.log(data); // 輸出 data 物件來檢查結構

  // 清除任何現有的選項，然後添加新的選項
  inoption.innerHTML = '';

  // 添加預設的 "請選擇" 選項
  const faultOption = document.createElement('option');
  faultOption.value = '';
  faultOption.textContent = '請選擇';
  inoption.appendChild(faultOption);

  // 檢查 data 是否是物件
  if (typeof data === 'object' && data !== null) {
    // 使用 Object.entries() 遍歷物件的每一個屬性
    Object.entries(data).forEach(([key, item]) => {

      if (item && item.areaId) {
        const optionone = document.createElement('option');
        optionone.value = item.areaId;  // 假設 areaId 是物件的屬性
        optionone.textContent = item.areaId;  // 同樣以 areaId 顯示文本
        inoption.appendChild(optionone);
      }
    });
  }
})

.catch(error =>{
  console.error('error',error);
})


// 選擇站號時回傳站點
let debounceTimeout;
document.getElementById('index').addEventListener('change', function() {
  clearTimeout(debounceTimeout); // 清除之前的定時器
  debounceTimeout = setTimeout(function() {
    const selectorAreaid = document.getElementById('index').value;
    const stationName = document.getElementById('stationName');
    
       // 清空 stationName 中的所有 <option> 元素
       stationName.innerHTML = '';
       // 先加入「請選擇」選項
       const defaultOption = document.createElement('option');
       defaultOption.value = '';
       defaultOption.textContent = '請選擇';
       stationName.appendChild(defaultOption);

    fetch("http://118.163.34.119:8088/api/Areaname", {
      method: 'POST',
      mode: "cors",
      headers: {
        "Content-Type": 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ areaid: selectorAreaid })
    })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP錯誤:${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log(data);
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        stationName.appendChild(option);
      });
    })
    .catch(error => {
      console.error('錯誤error:', error);
    });
  }, 300); 
});


// 儲存表單ID
const checkDate = document.getElementById('checkDate');
const carNumber = document.getElementById('carNumber');
const form = document.getElementById('allForm');
const table = document.getElementById('myTable');
const tbody = table.querySelector('tbody');

// 勾選狀態變更
checkDate.addEventListener('change', () => {
  checkDate.value = checkDate.checked ? 'true' : 'on';
});

// 車號輸入
carNumber.addEventListener('input', function() {
  carNumber.value = this.value;
});

let formTimeOut;
form.addEventListener('submit', function (event) {
  event.preventDefault(); // 阻止表單默認提交
  clearTimeout(formTimeOut);

  // 收集表單資料
  formTimeOut = setTimeout(() => {
    const formData = {
      index: document.getElementById('index').value,
      stationName: document.getElementById('stationName').value,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      check: checkDate.value,
      carNumber: carNumber.value,
    };
    console.log(formData.stationName);

    let currentPage = 1;
    const itemsPerPage = 50; // 每頁顯示的項目數量
    let totalPages = 10; // 總頁數
    let items = [];
    // 宣告並選擇 'pagination_data' 元素
const content = document.getElementById('pagination_data');
    // 發送 POST 請求
    fetch('http://118.163.34.119:8088/api/event', {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP錯誤 ${response.status}`);
        return response.json();
      })
      .then((data) => {
        items = data;
        clearTable();
        console.log(items);
        totalPages = Math.ceil(items.length / itemsPerPage); // 計算總頁數
       
        // 顯示當前頁面項目
        function displayItems() {
          const start = (currentPage - 1) * itemsPerPage;
          const end = start + itemsPerPage;
          const pageItems = items.slice(start, end);
         
          content.innerHTML = pageItems.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.measurementdatetime}</td>
              <td>${item.areaid}</td>
              <td>${item.carsno}</td>
              <td>${item.lmax}</td>
              <td>${item.l90}</td>
              <td>${item.windspeed}</td>
              <td>${item.tempture}</td>
              <td>${item.dba}</td>
              <td>${item.fL90}</td>
              <td>${item.determination}</td>
              <td style="display:none">${item.areaname}</td>
              <td style="display:none">${item.noise}</td>
              <td style="display:none">${item.wet}</td>
              <td style="display:none">${item.windlevel}</td>
              <td style="display:none">${item.rainday}</td>
              <td style="display:none">${item.determination}</td>
              <td style="display:none">${item.reason}</td>
              <td style="display:none">${item.detail}</td>
            </tr>
          `).join('');
        }
        
    // hard pagination
        function updatePagination() {
          const paginationContainer = document.getElementById('page-link');
          paginationContainer.innerHTML = '';
        
          const createPageItem = (page) => {
            return `<li class="page-item ${page === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${page}">${page}</a>
        </li>`;
          };
        
          const createEllipsis = () => {
            return `<li class="page-item disabled"><span class="page-link">...</span></li>`;
          };
        
          // 第一頁
          paginationContainer.innerHTML += createPageItem(1);
        
          if (currentPage > 4) {
            paginationContainer.innerHTML += createEllipsis();
          }
        
          // 當前頁前後3頁
          let startPage = Math.max(2, currentPage - 3);
          let endPage = Math.min(totalPages - 1, currentPage + 3);
        
          for (let i = startPage; i <= endPage; i++) {
            paginationContainer.innerHTML += createPageItem(i);
          }
        
          if (currentPage < totalPages - 3) {
            paginationContainer.innerHTML += createEllipsis();
          }
        
          // 最後一頁
          if (totalPages > 1) {
            paginationContainer.innerHTML += createPageItem(totalPages);
          }
        
          // 上一頁按鈕
          paginationContainer.innerHTML = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" id="prevPage">上一頁</a></li>` + paginationContainer.innerHTML;
        
          // 下一頁按鈕
          paginationContainer.innerHTML += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" id="nextPage">下一頁</a></li>`;
        
          // 更新按鈕事件
          document.querySelectorAll('.page-link[data-page]').forEach((link) => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const page = parseInt(link.getAttribute('data-page'));
              if (page >= 1 && page <= totalPages) {
                currentPage = page;
                displayItems();
                updatePagination();
              }
            });
          });
        
          document.getElementById('prevPage').addEventListener('click', () => {
            if (currentPage > 1) {
              currentPage--;
              displayItems();
              updatePagination();
            }
          });
        
          document.getElementById('nextPage').addEventListener('click', () => {
            if (currentPage < totalPages) {
              currentPage++;
              displayItems();
              updatePagination();
            }
          });
        }
    
        // 初始化頁面
        displayItems();
        updatePagination();

        // 單一事件監聽器
        content.addEventListener('click', handleTableRowClick);
        
      }
    
  )
    
      
      .catch((error) => {
        console.error('請求失敗:', error);
        clearTable(); // 超出範圍呼叫清空表格的函式
      });
  }, 500);
});

// 清空表格
function clearTable() {
  tbody.innerHTML = '';  // 直接清空 tbody 的內容，而不是逐行刪除
}


let currentRowData = null;  // 用來存儲當前被點擊的表格行資料

// 監聽表格行的點擊事件
function handleTableRowClick(event) {
  // 清除所有 radio & checkbox 的 checked 狀態
  document.querySelectorAll("input[type='radio'], input[type='checkbox']").forEach(input => {
    input.checked = false;
  });

  // 清空 select 下拉選單
  document.querySelectorAll("select").forEach(select => {
      select.selectedIndex = 0;
  });

  // 清空文字輸入框
  document.querySelectorAll("input[type='text'], input[type='datetime-local']").forEach(input => {
      input.value = "";
  });
  const row = event.target.closest('tr');  // 獲取被點擊的行
  if (row) {
    // 收集該行資料
    const cells = row.getElementsByTagName('td');
    const rowData = Array.from(cells).map(cell => cell.innerText);

    currentRowData = rowData;  // 保存當前選中的行資料
    console.log('選中的資料',currentRowData);
    // 填入判定結果
    // 設定 radio 按鈕
    document.querySelectorAll("input[type='radio']").forEach(radio => {
      if (radio.value === currentRowData[12] || radio.value === currentRowData[13] || radio.value === currentRowData[16]) {
        radio.checked = true;
      }
    });

    // 設定 checkbox (轉換為布林值)
    document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
      // 假設 checkbox 的 id 或 name 對應到 currentRowData 的位置
      if (currentRowData[14] === "true") {
        checkbox.checked = true;
      } else if (currentRowData[15] === "true") {
        checkbox.checked = true;
      }
    });

    // 設定 select 下拉選單
    document.querySelectorAll("select").forEach(select => {
      if (currentRowData[17]) {
        let selectedOption = select.querySelector(`option[value="${currentRowData[17]}"]`);
        if (selectedOption) {
          select.value = currentRowData[17]; // 設定選擇值
        }
      }
    });

    // 設定 input[name='detail']
    document.querySelectorAll("input[name='detail']").forEach(input => {
      if (currentRowData[18] === 'undefined') {
        input.value = '';
      }
    });

    // 更新表單資料顯示
    const fields = ['datetimeValue', 'stationValue', 'locationValue', 'carnoValue', 'noiseValue', 'backgroundValue', 'temperatureValue', 'windspeedValue'];
    const fieldValues = [
      rowData[1], rowData[2], rowData[11], rowData[3],
      rowData[4], rowData[5], rowData[7], rowData[6]
    ];

    fields.forEach((field, index) => {
      document.getElementById(field).innerText = fieldValues[index];
    });
    // 設置隱藏的二級字段
    const fieldtwo = ["datetimeValue_1", "stationValue_2", "locationValue_3", "carnoValue_4", 
                      "noiseValue_5", "backgroundValue_6", "temperatureValue_7", "windspeedValue_8"];
    
    fieldtwo.forEach((field, index) => {
      document.getElementById(field).innerText = fieldValues[index];
    });
    
    // 更新圖片和視頻
    const datetimeValue = rowData[1];
    const carnoValue = rowData[3];
    const encodedTime = encodeURIComponent(datetimeValue);
    const imgvideo = ['CL', 'Crest', 'AIcam', 'Surcam'];

    const vdo = imgvideo.map(item => {
      return fetch(`http://118.163.34.119:8088/api/exceed/photovideo/${item}/${encodedTime}/${carnoValue}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`照片无法取得, http:${response.status}`);
          }
          return response.blob();
        })
        .then(blob => {
          return URL.createObjectURL(blob);
        })
        .catch(error => {
          console.error('Error', error);
        });
    });

    Promise.all(vdo).then(results => {
      console.log(results);
      const photoBtn1 = document.getElementById('photoBtn1');
      const photoBtn = document.getElementById('photoBtn');
      const sameImg = document.getElementById('sameImg');
      const carVideoBtn = document.getElementById('carVideoBtn');
      const peakBtn = document.getElementById('peakBtn');
      const surroundVideoBtn = document.getElementById('surroundVideoBtn');
      const photo = document.getElementById('photo');
      const peak = document.getElementById('peak');
      const carVideo = document.getElementById('carVideo');
      const surroundVideo = document.getElementById('surroundVideo');

      // 設置圖片和視頻的src
      photoBtn1.src = results[0];  // 左邊圖片
      photo.src = results[0];  // 設置圖片
      sameImg.src = results[0];

      carVideo.src = results[2];  // 設置車輛視頻
      peak.src = results[1];  // 設置峰值圖片
      surroundVideo.src = results[3];  // 設置環繞視頻

      // 設置顯示邏輯
      photoBtn.addEventListener('click', () => {
        photo.style.display = 'block';
        peak.style.display = 'none';
        carVideo.style.display = 'none';
        surroundVideo.style.display = 'none';
      });

      carVideoBtn.addEventListener('click', () => {
        photo.style.display = 'none';
        peak.style.display = 'none';
        carVideo.style.display = 'block';
        surroundVideo.style.display = 'none';
      });

      peakBtn.addEventListener('click', () => {
        photo.style.display = 'none';
        peak.style.display = 'block';
        carVideo.style.display = 'none';
        surroundVideo.style.display = 'none';
      });

      surroundVideoBtn.addEventListener('click', () => {
        photo.style.display = 'none';
        peak.style.display = 'none';
        carVideo.style.display = 'none';
        surroundVideo.style.display = 'block';
      });
    });

    // 監聽 saveButton 的 click 事件
    document.getElementById("saveButton").addEventListener("click", function () {

      const formresult = {
        Noise: document.querySelector('input[name="noise"]:checked')?.value || "",
        Wet: document.querySelector('input[name="wet"]:checked')?.value || "",
        Windlevel: document.querySelector("#windlevel").checked ? 'true' : 'false',
        Rainday: document.querySelector("#rainday").checked ? 'true' : 'false',
        Determination: document.querySelector('input[name="result"]:checked')?.value || "",
        Reason: document.querySelector('select[name="reason"]').value || "",
        Detail: document.querySelector('input[name="detail"]')?.value || "",
        MeasurementDateTime: rowData[1],  // 使用當前選中的行資料
        CarsNo: rowData[3],  // 使用當前選中的車號
      };

      fetch("http://118.163.34.119:8088/api/exceed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formresult),
      })
        .then(response => response.json())  // 確保後端返回的是 JSON 格式
        .then(data => {
          console.log(data.exceedRecord);
          
        alert('儲存成功');
        })
        .catch(error => console.error("錯誤:", error));
    });
  }
}




    // 監聽右鍵點擊表格時顯示右鍵菜單
    document.addEventListener('DOMContentLoaded', function () {
      const table = document.getElementById('myTable');
      const tbody = table.querySelector('tbody');
      const contextMenu = document.getElementById('contextMenu');
      // 當右鍵點擊表格時顯示右鍵菜單
      table.addEventListener('contextmenu', function (event) {
        event.preventDefault(); // 取消默認的右鍵菜單

        // 取得右鍵位置，考慮頁面滾動的偏移
        const mouseX = event.clientX + window.scrollX; // 考慮頁面水平滾動
        const mouseY = event.clientY + window.scrollY; // 考慮頁面垂直滾動

        // 設置右鍵菜單的位置
        contextMenu.style.left = `${mouseX}px`;
        contextMenu.style.top = `${mouseY}px`;

        // 顯示右鍵菜單
        contextMenu.style.display = 'block';
        // 禁止背景元素的點擊
        tbody.style.pointerEvents = 'none';
      });

      // 點擊右鍵菜單項目後的處理
      document.getElementById('eventMaintenance').addEventListener('click', function () {
        contextMenu.style.display = 'none'; // 點擊後隱藏菜單
      });

      document.getElementById('exportFiles').addEventListener('click', function () {
        alert('執行 事件檔案匯出');
        contextMenu.style.display = 'none'; // 點擊後隱藏菜單
      });

      document.getElementById('calculateVolume').addEventListener('click', function () {
        alert('執行 計算背景音量');
        contextMenu.style.display = 'none'; // 點擊後隱藏菜單
      });

      document.getElementById('updatePhoto').addEventListener('click', function () {
        alert('執行 更新事件照片');
        contextMenu.style.display = 'none'; // 點擊後隱藏菜單
      });

      // 當點擊菜單外部區域時隱藏右鍵菜單
      document.addEventListener('click', function (event) {
        if (!contextMenu.contains(event.target)) {
          contextMenu.style.display = 'none';
          tbody.style.pointerEvents = 'auto';
        }
      });
    });
    // 讓按鈕切換時，可以在不同容器中顯示相應內容
    document.querySelectorAll('[data-bs-toggle="pilltog"]').forEach(button => {
      button.addEventListener('click', function () {
        // 移除所有按鈕的 active 類別
        document.querySelectorAll('.bnav').forEach(link => link.classList.remove('active'));

        // 添加當前按鈕的 active 類別
        this.classList.add('active');

        // 移除所有內容區塊的 active 類別
        document.querySelectorAll('.mypane').forEach(pane => pane.classList.remove('show', 'active'));

        // 顯示當前按鈕對應的內容區塊
        const targetId = this.getAttribute('data-bs-target');
        document.querySelector(targetId).classList.add('show', 'active');
      });
    });



    document.getElementById("valid").addEventListener("change", function () {
      let reasonSelect = document.getElementById("reason");
      reasonSelect.innerHTML = `
              <option value="">請選擇原因</option>
              <option value="直接開罰">直接開罰</option>
              <option value="通知到檢">通知到檢</option>
          `;
    });
  
    document.getElementById("invalid").addEventListener("change", function () {
      let reasonSelect = document.getElementById("reason");
      reasonSelect.innerHTML = `
              <option value="">請選擇原因</option>
              <option value="非噪音車">非噪音車</option>
              <option value="無法判定">無法判定</option>
              <option value="其他">其他</option>
          `;
    });



