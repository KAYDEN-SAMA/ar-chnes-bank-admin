import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getDatabase, ref, get, set, push } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import { setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjuPHyoBchvfSf-FYXqXk4y2iwtekIHv0",
  authDomain: "arachnes-website.firebaseapp.com",
  databaseURL: "https://arachnes-website-default-rtdb.firebaseio.com",
  projectId: "arachnes-website",
  storageBucket: "arachnes-website.appspot.com",
  messagingSenderId: "598408301141",
  appId: "1:598408301141:web:06d254956c7fa87a1be2dc"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const errorParagraph = document.getElementById("errorParagraph");
const loginButton = document.getElementById("loginButton");
const showPasswordCheckbox = document.getElementById("showPassword");
const loginForm = document.getElementById("LoginForm");
const dataSection = document.getElementById("dataSection");

onAuthStateChanged(auth, user => {
  if (user) {
    loginForm.style.display = "none";
    dataSection.style.display = "block";
    guildDropDown.style.display = "flex";
    loadUserData(user);
  } else {
    loginForm.style.display = "block";
    dataSection.style.display = "none";
    guildDropDown.style.display = "none";
  }
});

let selectGuild = localStorage.getItem('selectGuild') || "aráchnes";

function loadUserData(user) {
  const adminUid = user.uid;
  get(ref(db, `admins/${adminUid}`)).then(adminSnapshot => {
    if (adminSnapshot.exists()) {
      const data = adminSnapshot.val();
      
      const guildDropDown = document.getElementById('selectedGuild');
      data.allowedGuilds.forEach(guild => {
        const option = document.createElement('option');
        option.value = guild.trim();
        option.textContent = guild.trim();
        if (guild.trim() === selectGuild) {
          option.selected = true;
        }
        guildDropDown.appendChild(option);
      });
      loadGuildData(selectGuild);

      guildDropDown.addEventListener('change', function() {
        selectGuild = this.value;
        localStorage.setItem('selectGuild', this.value);
        loadGuildData(selectGuild);
      });
    }
  });
}

function loadGuildData(selectGuild) {
  const header = document.getElementById("header");
  const addMemberDiv = document.getElementById("addMemberDiv");
  get(ref(db, `guilds/${selectGuild}`)).then(allowedGuildsnapshot => {
    if (allowedGuildsnapshot.exists()) {
      dataSection.innerHTML = "";
      addMemberDiv.innerHTML = "";
      
      const addMemberBtn = document.createElement('i');
      
      addMemberBtn.className = "fa-sharp fa-solid fa-plus";
      addMemberBtn.id = 'addMemberBtn';
      
      addMemberDiv.appendChild(addMemberBtn);
      header.appendChild(addMemberDiv);
      
      addMemberBtn.addEventListener('click', () => {
        const dialog = document.createElement('div');
        dialog.innerHTML = `<div class="dialog"><label for="username">اللقب:</label><input type="text" id="username" placeholder="اللقب" maxlength="12"><label for="rank">الرتبة:</label><input type="text" id="rank" placeholder="الرتبة" maxlength="12"><label for="balance">الرصيد:</label><input type="number" id="balance" placeholder="الرصيد"><label for="bagage">السلعة:</label><input type="text" id="bagage" placeholder="السلعة"><label for="warnings">الإنذارات:</label><input type="number" id="warnings" placeholder="الإنذارات"><p id="errorElm"></p><div class="buttons-div"><button id="confirmBtn">تأكيد</button><button id="cancelBtn">إلغاء</button></div></div>`;
        document.body.appendChild(dialog);
        document.body.classList.add('modal-open');
        
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        confirmBtn.addEventListener('click', () => {
          const usernameInput = document.getElementById('username');
          const rankInput = document.getElementById('rank');
          const balanceInput = document.getElementById('balance');
          const bagageInput = document.getElementById('bagage');
          const warningsInput = document.getElementById('warnings');
          const errorElm = document.getElementById('errorElm');
          const username = usernameInput.value.trim();
          const rank = rankInput.value.trim();
          const balance = balanceInput.value.trim();
          const bagage = bagageInput.value.trim();
          const warnings = warningsInput.value.trim();
          if (username === "" || rank === "" || balance === "" || bagage === "" || warnings === "") {
            errorElm.textContent = "إملأ كل الحقول المطلوبة";
          } else {
            const newMemberRef = ref(db, `guilds/${selectGuild}/${username}`);
            set(newMemberRef, {
              username: username,
              rank: rank,
              balance: balance,
              bagage: bagage,
              warnings: warnings
            }).then(() => {
              alert('تم إضافة العضو بنجاح!');
              dialog.remove();
              location.reload();
            }).catch(error => {
              alert('حصل خطأ أثناء إضافة العضو: ' + error.message);
            });
          }
        });
        
        cancelBtn.addEventListener('click', () => {
          dialog.remove();
          document.body.classList.remove('modal-open');
        });
      });
      const guildData = allowedGuildsnapshot.val();
      const sortedMemberIds = Object.keys(guildData).sort((a, b) => {
        const valueA = guildData[a].toString();
        const valueB = guildData[b].toString();
        return valueA.localeCompare(valueB, 'ar');
      });
      sortedMemberIds.forEach(memberId => {
        const memberData = guildData[memberId];
        createMemberCard(memberId, memberData);
      });
    } else {
        addMemberDiv.innerHTML = "";
      
      const addMemberBtn = document.createElement('i');
      
      addMemberBtn.className = "fa-sharp fa-solid fa-plus";
      addMemberBtn.id = 'addMemberBtn';
      
      addMemberDiv.appendChild(addMemberBtn);
      header.appendChild(addMemberDiv);
      
      addMemberBtn.addEventListener('click', () => {
        const dialog = document.createElement('div');
        dialog.innerHTML = `<div class="dialog"><label for="username">اللقب:</label><input type="text" id="username" placeholder="اللقب" maxlength="12"><label for="rank">الرتبة:</label><input type="text" id="rank" placeholder="الرتبة" maxlength="12"><label for="balance">الرصيد:</label><input type="number" id="balance" placeholder="الرصيد"><label for="bagage">السلعة:</label><input type="text" id="bagage" placeholder="السلعة"><label for="warnings">الإنذارات:</label><input type="number" id="warnings" placeholder="الإنذارات"><p id="errorElm"></p><div class="buttons-div"><button id="confirmBtn">تأكيد</button><button id="cancelBtn">إلغاء</button></div></div>`;
        document.body.appendChild(dialog);
        document.body.classList.add('modal-open');
        
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        confirmBtn.addEventListener('click', () => {
          const usernameInput = document.getElementById('username');
          const rankInput = document.getElementById('rank');
          const balanceInput = document.getElementById('balance');
          const bagageInput = document.getElementById('bagage');
          const warningsInput = document.getElementById('warnings');
          const errorElm = document.getElementById('errorElm');
          const username = usernameInput.value.trim();
          const rank = rankInput.value.trim();
          const balance = balanceInput.value.trim();
          const bagage = bagageInput.value.trim();
          const warnings = warningsInput.value.trim();
          if (username === "" || rank === "" || balance === "" || bagage === "" || warnings === "") {
            errorElm.textContent = "إملأ كل الحقول المطلوبة";
          } else {
            const newMemberRef = ref(db, `guilds/${selectGuild}/${username}`);
            set(newMemberRef, {
              username: username,
              rank: rank,
              balance: balance,
              bagage: bagage,
              warnings: warnings
            }).then(() => {
              alert('تم إضافة العضو بنجاح!');
              dialog.remove();
              location.reload();
            }).catch(error => {
              alert('حصل خطأ أثناء إضافة العضو: ' + error.message);
            });
          }
        });
        
        cancelBtn.addEventListener('click', () => {
          dialog.remove();
          document.body.classList.remove('modal-open');
        });
      });
      dataSection.innerHTML = "";
    }
  });
}

function createMemberCard(memberId, memberData) {
  const card = document.createElement("div");
  const usernameDiv = document.createElement("div");
  const usernameTitle = document.createElement("h3");
  const usernameEl = document.createElement("p");
  const rankDiv = document.createElement("div");
  const rankTitle = document.createElement("h3");
  const rankEl = document.createElement("p");
  const balanceDiv = document.createElement("div");
  const balanceTitle = document.createElement("h3");
  const balanceEl = document.createElement("p");
  const bagageDiv = document.createElement("div");
  const bagageTitle = document.createElement("h3");
  const bagageEl = document.createElement("p"); 
  const warningsDiv = document.createElement("div");
  const warningsTitle = document.createElement("h3");
  const warningsEl = document.createElement("p");
  
  const iconsDiv = document.createElement("div");
  const deleteBtn = document.createElement("i");
  const editBtn = document.createElement("i");
  
  card.className = "member-card";
  usernameEl.className = "member-username";
  rankEl.className = "member-rank";
  balanceEl.className = "member-balance";
  
  deleteBtn.className = "fa-solid fa-trash";
  editBtn.className = "fa-solid fa-pen";
  
  usernameTitle.textContent = "اللقب: ";
  usernameEl.textContent = memberData.username;
  rankTitle.textContent = "الرتبة: ";
  rankEl.textContent = memberData.rank;
  balanceTitle.textContent = "الرصيد: ";
  balanceEl.textContent = memberData.balance;
  bagageTitle.textContent = "السلعة: ";
  bagageEl.textContent = memberData.bagage;
  warningsTitle.textContent = "الإنذارات: ";
  warningsEl.textContent = memberData.warnings;
  
  deleteBtn.onclick = function() {
    if (confirm("متأكد من حذف هذا العضو؟")) {
      const memberRef = ref(db, `guilds/${selectGuild}/${memberId}`);
      set(memberRef, null)
        .then(() => {
          alert('لقد تم حذف العضو بنجاح')
          card.remove();
        })
        .catch(error => {
          alert('حصل خطأ أثناء الحذف: ', error);
        });
    }
  };
  let isEditable = false;
  editBtn.addEventListener('click', () => {
    if (!isEditable) {
      usernameEl.contentEditable = true;
      rankEl.contentEditable = true;
      balanceEl.contentEditable = true;
      bagageEl.contentEditable = true;
      warningsEl.contentEditable = true;
      editBtn.className = "fa-solid fa-floppy-disk";
      isEditable = true;
    } else {
      set(ref(db, `guilds/${selectGuild}/${memberId}`), {
        username: usernameEl.textContent,
        rank: rankEl.textContent,
        balance: balanceEl.textContent,
        bagage: bagageEl.textContent,
        warnings: warningsEl.textContent
      });
      usernameEl.contentEditable = false;
      rankEl.contentEditable = false;
      balanceEl.contentEditable = false;
      bagageEl.contentEditable = false;
      warningsEl.contentEditable = false;
      editBtn.className = "fa-solid fa-pen";
      isEditable = false;
    }
  });
  usernameDiv.appendChild(usernameTitle);
  usernameDiv.appendChild(usernameEl);
  rankDiv.appendChild(rankTitle);
  rankDiv.appendChild(rankEl);
  balanceDiv.appendChild(balanceTitle);
  balanceDiv.appendChild(balanceEl);
  bagageDiv.appendChild(bagageTitle);
  bagageDiv.appendChild(bagageEl);
  warningsDiv.appendChild(warningsTitle);
  warningsDiv.appendChild(warningsEl);
  iconsDiv.appendChild(deleteBtn);
  iconsDiv.appendChild(editBtn);
  card.appendChild(usernameDiv);
  card.appendChild(rankDiv);
  card.appendChild(balanceDiv);
  card.appendChild(bagageDiv);
  card.appendChild(warningsDiv);
  card.appendChild(iconsDiv);
  dataSection.appendChild(card);
}

showPasswordCheckbox.addEventListener('change', function() {
  passwordInput.type = this.checked ? "text" : "password";
});

loginButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (email === "" || password === "") {
    errorParagraph.style.display = "block";
    errorParagraph.textContent = "أدخل البريد الإلكتروني و كلمة المرور معا!";
    return;
  }

  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    errorParagraph.style.display = "block";
    errorParagraph.textContent = error.message;
  }
});