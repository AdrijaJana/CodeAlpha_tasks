const display = document.getElementById('display');

function appendValue(value){
  display.value += value;
}

function clearDisplay(){
  display.value = '';
}

function deleteLast(){
  display.value = display.value.slice(0, -1);
}

function calculate(){
  try{
    display.value = eval(display.value);
  }catch{
    display.value = 'Error';
  }
}

// Bonus: Keyboard support
document.addEventListener('keydown', (e) => {
  if((e.key >= '0' && e.key <= '9') || ['+','-','*','/','.'].includes(e.key)){
    appendValue(e.key);
  }
  if(e.key === 'Enter') calculate();
  if(e.key === 'Backspace') deleteLast();
  if(e.key === 'Escape') clearDisplay();
});

