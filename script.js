'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
//gelocation
class workout{
    date=new Date();
    id=Date.now();
    constructor(coords,distance,duration){
this.coords=coords;
this.distance=distance;
this.duration=duration;

    }
    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
            months[this.date.getMonth()]
          } ${this.date.getDate()}`;      
    }

}
class running extends workout{
    constructor(coords,distance,duration,cadence){
super(coords,distance,duration);
this.cadence=cadence;
this.type="running";
this.calcpace();
this._setDescription();
    }
        calcpace(){
       this.pace= this.distance/this.duration;
       return this.pace
    }
}
class cycling extends workout{
    constructor(coords,distance,duration,elevationGain){
super(coords,distance,duration);
this.elevationGain=elevationGain;
this.type="cycling";
this.calcspeed()
this._setDescription();
    }
    calcspeed(){
        this.speed=this.distance/(this.duration/60);
        return this.speed;
    }
}

// const runningTest= new running([39,-12],5.2,24,178);
// console.log(runningTest);





//***************************************************************
//APPLICATION ARCHITECTURE
class App{
    #map;
    #mapEVENT;
    #mapZoomLevel=13;
    #workouts=[];
    constructor(){
        this._getPosition();
        this._getLocalStorage();
        form.addEventListener('submit',this._newWorkout.bind(this));
        inputType.addEventListener('change',this._toggleEelevationField.bind(this));
        containerWorkouts.addEventListener('click',this._moveToMarkerPopup.bind(this));
    }
    //getting position coords
    _getPosition(){
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
     function(){
        alert("could not able to fetch your current location");
    })
 }
// loading map
        _loadMap(position){
                //console.log(position);
                const {latitude}= position.coords;
                const {longitude}=position.coords;
                 console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
                  this.#map = L.map('map').setView([latitude,longitude], this.#mapZoomLevel);
            
            L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
            
            
            this.#map.on('click',this._showForm.bind(this));
            //rendering workout marker from local storage
            this.#workouts.forEach(work => {
                this.renderMarker(work);
            });
            
        }
        _showForm(mapE){
               // console.log(mapE);
                this.#mapEVENT=mapE;
                form.classList.remove('hidden');
                inputDistance.focus();
                };
        _hideForm(){
            inputDistance.value=inputCadence.value=inputDuration.value=inputElevation.value="";
            form.style.display='none';
            form.classList.add('hidden');
            setTimeout(()=> form.style.display='grid',1000);
        }
        _toggleEelevationField(){
                const test= inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
                 inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
                 //console.log(test);
             
        }
        _newWorkout(e){
                e.preventDefault();
                const validcheck = (...inputs) => inputs.every(ins =>Number.isFinite(ins)); 
                const allPositive = (...inputs) => inputs.every(ins =>ins >0); 
                //getting values entered
const type = inputType.value;

const distance= +inputDistance.value;
const duration= +inputDuration.value;
const cadence = +inputCadence.value;
const elevation = +inputElevation.value;
const {lat,lng}=this.#mapEVENT.latlng;
let workout;
//valid the values 

//if runnuning create running workout(based on type we are giving)
if(type === "running"){
    if(!validcheck(distance,duration,cadence) || !allPositive(distance,duration,cadence))
return alert("give only positive values")
     workout = new running([lat,lng],distance,duration,cadence);
}
//if cycling create cycling workout
if(type === "cycling"){
    if(!validcheck(distance,duration,elevation) || !allPositive(distance,duration))
return alert("give only positive values")
 workout = new cycling([lat,lng],distance,duration,elevation);
}
//add workout in workouts array
this.#workouts.push(workout);
console.log(this.#workouts);
//render workout in form
this.renderWorkoutForm(workout);
//render workout in marker
this.renderMarker(workout);
//hide form input  and clear inputs on form
this._hideForm();
//storing in local store...
this._setLocalStorage();

    }
    renderMarker(workout){

        L.marker(workout.coords).addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth:250,
            minWidth:100, 
            autoClose:false,
            closeOnClick:false,
            className: `${workout.type}-popup`,
        })).setPopupContent(` ${workout.description}`)
        .openPopup();
       
    }
    renderWorkoutForm(workout){
let html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
<h2 class="workout__title">${workout.description}</h2>
<div class="workout__details">
  <span class="workout__icon">${workout.type === "running" ? "🏃‍♂️": "🚴‍♀️"}</span>
  <span class="workout__value">${workout.distance}</span>
  <span class="workout__unit">km</span>
</div>
<div class="workout__details">
  <span class="workout__icon">⏱</span>
  <span class="workout__value">${workout.duration}</span>
  <span class="workout__unit">min</span>
</div>`
if(workout.type === "running"){
    html += `<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace.toFixed(1)}</span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadence}</span>
    <span class="workout__unit">spm</span>
  </div>
</li>`;
}
if(workout.type === "cycling"){
    html += `<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.speed.toFixed(1)}</span>
    <span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⛰</span>
    <span class="workout__value">${workout.elevationGain}</span>
    <span class="workout__unit">m</span>
  </div>
</li>`;
}
form.insertAdjacentHTML('afterend',html);
    }
    //moving marker to popups that were clicked
    _moveToMarkerPopup(e){
const workoutEl = e.target.closest('.workout');
console.log(workoutEl);

if(!workoutEl) return;

//console.log(workoutEl.dataset.id);
const selworkout = this.#workouts.find(work => work.id == workoutEl.dataset.id);
console.log(selworkout);
this.#map.setView(selworkout.coords,this.#mapZoomLevel,{
    animate : true,
    pan : {
        duration : 1
    }
})
    
    }
    //storing data and getting from local storage
_setLocalStorage(){
    localStorage.setItem('workouts',JSON.stringify(this.#workouts));
}
//getting data from local storage
_getLocalStorage(){
const data= JSON.parse(localStorage.getItem('workouts'));
if(!data) return;
this.#workouts = data;
this.#workouts.forEach(work => {
    this.renderWorkoutForm(work);
});
}
reset(){
    localStorage.removeItem('workouts');
    location.reload();
}
}

const app= new App();


 