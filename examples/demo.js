import * as L from 'leaflet';
import SearchBox from '../dist/leaflet.searchbox.esm.js'
import '../src/style.css';
import 'leaflet/dist/leaflet.css';

function button2_click() {
    console.log('button 2 clicked !!!');

}

var map = L.map('map').setView([51.505, -0.09], 5);
map.zoomControl.setPosition('topright');
map.addLayer(new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors' }
));


var control = new SearchBox({
    // remove these if dont need sidebar
    sidebarTitleText: 'Header',
    sidebarMenuItems: {
        Items: [
            { type: "link", name: "Link 1 (github.com)", href: "http://github.com", icon: "icon-local-carwash" },
            { type: "link", name: "Link 2 (google.com)", href: "http://google.com", icon: "icon-cloudy" },
            { type: "button", name: "Button 1", onclick: "alert('button 1 clicked !')", icon: "icon-potrait" },
            { type: "button", name: "Button 2", onclick: "button2_click();", icon: "icon-local-dining" },
            { type: "link", name: "Link 3 (stackoverflow.com)", href: 'http://stackoverflow.com', icon: "icon-bike" },

        ]
    }
});

map.addControl(control);