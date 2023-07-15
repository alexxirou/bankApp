'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

let currentAccount, timer;

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////


function tick(time) {
  const min = Math.trunc(time / 60).toString().padStart(2, '0');
  const sec = (time % 60).toString().padStart(2, '0');
  
  // In each call, print the remaining time to UI
  labelTimer.textContent = `${min}:${sec}`;
  if (time === 0) {
    clearInterval(timer);
    labelWelcome.textContent = "Log in to get started";
    containerApp.style.opacity = 0;
    currentAccount='';
  }
  else {
  // Decrease 1s
    time--;
    return time;
  }  
}


function startLogOutTimer() {
  let time = 300;
  time = tick(time);
  timer = setInterval(() => {  

  time = tick(time);

  }, 1000);
  return timer;
}




function formatDate(date, locale){
  const day = `${date.getDate()}`.padStart(2, 0);
  const month = (`${date.getMonth()+1}`).padStart(2, 0); // Months are zero-based, so we add 1
  const year = date.getFullYear();
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
}


function calcDaysPassed(date1, date2){
  let res = Math.abs(date2 - date1) / 86400000;
  return Math.round(res);
}

function displayMovements(acc , sort = false){
  let sortedMovements;
  let sortedMovementsDates; 

  if (sort){
    const indices = Array.from(acc.movements.keys());
    indices.sort((a, b) => acc.movements[a] - acc.movements[b]);
    sortedMovements = indices.map(i => acc.movements[i]);
    sortedMovementsDates = indices.map(i => acc.movementsDates[i]);
  }
  else {
    sortedMovements=acc.movements;
    sortedMovementsDates=acc.movementsDates;
  } 
  containerMovements.innerHTML= '';
  sortedMovements.forEach((e, i)=>{
    const type = e > 0 ? 'deposit' : 'withdrawal';
    const formattedMov = formatCur(sortedMovements[i], acc.locale, acc.currency);
    const formattedDat =formatDate(new Date(sortedMovementsDates[i]), acc.locale);
    const htmlText = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${formattedDat}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', htmlText);
  });
}


function formatCur(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,}).format(Number(value));
}

function displayBalance(acc){
  let balance=calcBalance(acc.movements)
  labelBalance.textContent = formatCur(balance, acc.locale, acc.currency);
  labelDate.textContent= formatDate(new Date(acc.movementsDates[acc.movementsDates.length - 1]));

}


function calcBalance(arr){
   return (arr.reduce((sum, currentValue) => sum + currentValue, 0)).toFixed(2);

}


function calcSummaryIn(arr){
  let filteredArray = arr.filter((mv) => mv>0);
  return calcBalance(filteredArray);
}

function calcSummaryOut(arr){
  let filteredArray = arr.filter((mv) => mv<0);
  return (Math.abs(calcBalance(filteredArray)))
}


function displaySummary(acc){
 labelSumIn.textContent=formatCur(calcSummaryIn(acc.movements), acc.locale, acc.currency);
 labelSumOut.textContent=formatCur(calcSummaryOut(acc.movements), acc.locale, acc.currency) 
}


function calcInterest(mv, ir=2){
  let res = calcBalance(mv);
  return (res*ir)/100;
}

function displayInterest(acc, ir=2){
  labelSumInterest.textContent=formatCur(calcInterest(acc.movements, ir), acc.locale, acc.currency);
}


function createUsername(accs) {
  accs.forEach(function (acc) { acc.username = acc.owner.toLowerCase()
    .split(' ').map(name => name[0]).join('');
  });
};


function updateUI(acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  displayBalance(acc);

  // Display summary
  displaySummary(acc);

  displayInterest(acc, acc.interestRate);
};

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  //console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number((inputLoanAmount.value));

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(() => {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);},3000);
  }
  inputLoanAmount.value = '';
  // Reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
 
});


btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    setTimeout(() => {
      
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    console.log(currentAccount.movements);
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
    },3000);
  }
  // Reset timer
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
});


btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
  // Reset timer
  clearInterval(timer);
  
});


let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted=!sorted;
  // Reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
});

createUsername(accounts); 