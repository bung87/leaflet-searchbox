import * as L from 'leaflet';
import bean from 'bean';
import {
    OpenStreetMapProvider
} from 'leaflet-geosearch';
import debounce from 'lodash/debounce';
const template = require('lodash.template');

function generateHtmlContent(menuItems) {
    var content = '<ul class="leaflet-searchbox-panel-list">'

    for (var i = 0; i < menuItems.Items.length; i++) {
        var item = menuItems.Items[i];
        content += '<li class="leaflet-searchbox-panel-list-item"><div>';
        if (item.type == 'link') {
            content += '<span class=\"leaflet-searchbox-panel-list-item-icon ' + item.icon + '\" ></span>';
            content += '<a href=\"' + item.href + '\">' + item.name + '</a>';
        } else if (item.type == 'button') {
            content += '<span class=\"leaflet-searchbox-panel-list-item-icon ' + item.icon + '\" ></span>';
            content += '<button onclick=\"' + item.onclick + '\">' + item.name + '</button>';

        }
        content += '</li></div>'
    }

    content += '</ul>'
    return content;
}

function resultItemClickCallback(e) {
    e.preventDefault();
    // lat lng
    var location = L.latLng([parseFloat(e.target.dataset.y), parseFloat(e.target.dataset.x)]);
    this._map.panTo(location);
    this._map.fireEvent('geosearch/showlocation', {
        location: {
            latlng: location,
            ...e.target.dataset
        }
    });
    this._hideSearchResult();
}

function suggest(query) {
    let provider = this.options.provider;
    provider.search({
            query: query
        })
        .then((r) => {
            this._genResultList(r);
            this._showSearchResult();
        });

    this._map.once('click', (ev) => {
        this._hideSearchResult();
    });
}

L.Control.SearchBox = L.Control.extend({
    options: {
        position: 'topleft',
        provider: new OpenStreetMapProvider(),
        resultItemClickCallback: resultItemClickCallback,
        suggest: suggest,
        resultItemTemplate: `<a href="#" data-x="<%- item.x %>" 
        data-y="<%- item.y %>" 
        data-label="<%- item.label %>" 
        data-class="<%- item.raw.class %>" data-type="<%- item.raw.type %>" data-display_name="<%-item.raw.display_name%>"><%- item.label %></a>`
    },
    initialize: function(options) {
        L.Util.setOptions(this, options);
        if (options.sidebarTitleText) {
            this._sideBarHeaderTitle = options.sidebarTitleText;
        }

        if (options.sidebarMenuItems) {
            this._sideBarMenuItems = options.sidebarMenuItems;

        }
    },
    _isSideEnabled() {
        return this._sideBarHeaderTitle || this._sideBarMenuItems;
    },
    _createPanelContent: function(menuItems) {
        var container = L.DomUtil.create('div', 'leaflet-searchbox-panel-content');
        var htmlContent = generateHtmlContent(menuItems);
        container.innerHTML = htmlContent;
        return container;
    },
    _createPanel: function(headerTitle, menuItems) {
        var container = L.DomUtil.create('div', 'leaflet-searchbox-panel leaflet-searchbox-control-shadow');
        container.innerHTML = `
        <div class="leaflet-searchbox-panel-header">
            <div class="leaflet-searchbox-panel-header-container">
                <i class="leaflet-searchbox-home"></i><span class="leaflet-searchbox-panel-header-title">${headerTitle}</span>
                <button aria-label="Menu" class="leaflet-searchbox-panel-close-button"></button>
            </div>
        </div>
        `
        container.appendChild(this._createPanelContent(menuItems))
        return container
    },
    _createControl: function() {
        var sideEnabled = this._isSideEnabled()
        var container = L.DomUtil.create('div', "leaflet-searchbox-control");
        container.innerHTML = `
                <div  class="leaflet-searchbox-control-container leaflet-searchbox-control-shadow" >
                    ${sideEnabled ?
                `<div class="leaflet-searchbox-control-menu-container">
                            <button aria-label="Menu" class="leaflet-searchbox-control-menu-button"></button> 
                            <span aria-hidden="true"  style="display:none">Menu</span> 
                        </div>` :
                ""}
						<input class="leaflet-searchbox-control-input" type="text"  />
					<div class="leaflet-searchbox-control-search-container">
                        <button aria-label="search"  class="leaflet-searchbox-control-search-button"></button> 
                        <span aria-hidden="true"  style="display:none;">search</span>
                    </div>
                    <div class="leaflet-searchbox-control-search-result"></div>
                </div>
                `
        return container;
    },
    _genResultList: function(result) {
        var list = `<ul class="leaflet-searchbox-result-list"><% result.forEach( function(item) { %>
            <li class="leaflet-searchbox-result-list-item">${this.options.resultItemTemplate}</li>
            <% }); %></ul>`;
        this.getContainer().querySelector('.leaflet-searchbox-control-search-result').innerHTML = template(list)({
            result
        })
    },
    _showSearchResult: function() {
        this.getContainer().querySelector('.leaflet-searchbox-control-search-result').style.display = 'block';
        this._map.once('click', (ev) => {
            this._hideSearchResult();
        });
    },
    _hideSearchResult: function() {
        this.getContainer().querySelector('.leaflet-searchbox-control-search-result').style.display = 'none';
    },
    _clearSearchResult: function() {
        this.getContainer().querySelector('.leaflet-searchbox-control-search-result').innerHTML = '';
    },
    openPanel() {
        var panel = this.getContainer().querySelector('.leaflet-searchbox-panel');
        panel.style.left = '0px';
    },
    closePanel() {
        var panel = this.getContainer().querySelector('.leaflet-searchbox-panel');
        panel.style.left = `-100%`;
    },
    onAdd: function(map) {
        this.options.provider = new OpenStreetMapProvider();
        var container = L.DomUtil.create('div', "leaflet-searchbox-control-wrapper");
        var headerTitle = this._sideBarHeaderTitle;
        var menuItems = this._sideBarMenuItems;
        var sideEnabled = this._isSideEnabled()
        container.appendChild(this._createControl());
        map.on("searchbox/openPanel",e => this.openPanel())
        map.on("searchbox/closePanel",e => this.closePanel())
        if (sideEnabled)
            container.appendChild(this._createPanel(headerTitle, menuItems));

        bean.on(container, 'keyup', ".leaflet-searchbox-control-input",

            debounce((e) => {
                let value = e.target.value;
                if (value.length === 0) {
                    this._clearSearchResult();
                }
                if (value.length < 2) {
                    return;
                }
                this.options.suggest.bind(this)(value)
            }, 300)
        );
        bean.on(container, 'click', ".leaflet-searchbox-control-input", (e) => {
            this._showSearchResult();
        });

        bean.on(container, 'click', ".leaflet-searchbox-control-search-button", debounce(() => {
            var value = this.getContainer().querySelector(".leaflet-searchbox-control-input").value;
            this.options.suggest.bind(this)(value);
        }, 300, {
            'leading': true,
            'trailing': false
        }));

        if (sideEnabled) {
            bean.on(container, 'click', ".leaflet-searchbox-control-menu-button", (e) => {
                this.openPanel()

            });
            bean.on(container, 'click', ".leaflet-searchbox-panel-close-button", (e) => {
                this.closePanel()
            });
        }
        bean.on(container,'click', '.leaflet-searchbox-home',(e) => {
            map.fireEvent('searchbox/homeclicked')
        })
        bean.on(container, 'click', '.leaflet-searchbox-result-list-item a', this.options.resultItemClickCallback.bind(this))

        L.DomEvent.disableClickPropagation(container);
        return container;
    }

});
L.control.searchbox = function(options) {
    return new L.Control.SearchBox(options)
}
export default L.Control.SearchBox