import * as L from 'leaflet';
import bean from 'bean';
import { OpenStreetMapProvider } from 'leaflet-geosearch/src/providers';
import debounce from 'lodash/debounce';

function generateHtmlContent(menuItems) {
    var content = '<ul class="panel-list">'

    for (var i = 0; i < menuItems.Items.length; i++) {
        var item = menuItems.Items[i];
        content += '<li class="panel-list-item"><div>';
        if (item.type == 'link') {
            content += '<span class=\"panel-list-item-icon ' + item.icon + '\" ></span>';
            content += '<a href=\"' + item.href + '\">' + item.name + '</a>';
        }
        else if (item.type == 'button') {
            content += '<span class=\"panel-list-item-icon ' + item.icon + '\" ></span>';
            content += '<button onclick=\"' + item.onclick + '\">' + item.name + '</button>';

        }
        content += '</li></div>'
    }

    content += '</ul>'
    return content;
}

L.Control.SearchBox = L.Control.extend({
    options: {
        position: 'topleft'
    },
    initialize: function (options) {
        L.Util.setOptions(this, options);
        if (options.sidebarTitleText) {
            this._sideBarHeaderTitle = options.sidebarTitleText;
        }

        if (options.sidebarMenuItems) {
            this._sideBarMenuItems = options.sidebarMenuItems;

        }
    },
    _createPanelContent: function (menuItems) {
        var container = L.DomUtil.create('div', 'panel-content');
        var htmlContent = generateHtmlContent(menuItems);
        container.innerHTML = htmlContent;
        return container;
    },
    _createPanel: function (headerTitle, menuItems) {
        var container = L.DomUtil.create('div', 'panel');
        container.innerHTML = `
        <div class="panel-header">
            <div class="panel-header-container">
                <span class="panel-header-title">${headerTitle}</span>
                <button aria-label="Menu" id="panelbutton" class="panel-close-button"></button>
            </div>
        </div>
        `
        container.appendChild(this._createPanelContent(menuItems))
        return container
    },
    _createControl: function () {
        var headerTitle = this._sideBarHeaderTitle;
        var menuItems = this._sideBarMenuItems;
        var sideEnabled = headerTitle && menuItems;
        var container = L.DomUtil.create('div');
        container.id = 'controlbox'
        container.innerHTML = `
                <div id="boxcontainer" class="searchbox searchbox-shadow" >
                    ${sideEnabled ?
                        `<div class="searchbox-menu-container">
                            <button aria-label="Menu" id="searchbox-menubutton" class="searchbox-menubutton"></button> 
                            <span aria-hidden="true"  style="display:none">Menu</span> 
                        </div>` : 
                        ""}
						<input id="searchboxinput" type="text"  style="position: relative;" />
					<div class="searchbox-searchbutton-container">
                        <button aria-label="search"  id="searchbox-searchbutton"  class="searchbox-searchbutton"></button> 
                        <span aria-hidden="true"  style="display:none;">search</span>
                    </div>
                    <div class="search-result"></div>
                </div>
                `
        return container;
    },
    _genResultList: function (result) {
        var content = '<ul class="result-list">'
        for (var i = 0; i < result.length; i++) {
            var item = result[i];
            content += '<li class="result-list-item">';
            content += `<a href="#" data-x="${item.x}" data-y="${item.y}">${item.label}</a>`;
            content += '</li>'
        }
        content += '</ul>'
        document.querySelector('.search-result').innerHTML = content
    },
    _showSearchResult: function () {
        let self = this;
        document.querySelector('.search-result').style.display = 'block';
        self._map.once('click', function a(ev) {
            self._hideSearchResult();
        });
    },
    _hideSearchResult: function () {
        document.querySelector('.search-result').style.display = 'none';
    },
    _clearSearchResult: function () {
        document.querySelector('.search-result').innerHTML = '';
    },
    _suggest: function (query) {
        let provider = this.provider;
        let self = this;
        provider.search({ query: query })
            .then((r) => {
                self._genResultList(r);
                self._showSearchResult();
            });

        self._map.once('click', function a(ev) {
            self._hideSearchResult();
        });
    },
    onAdd: function (map) {
        this.provider = new OpenStreetMapProvider();
        var container = L.DomUtil.create('div');
        container.id = "controlcontainer";
        var headerTitle = this._sideBarHeaderTitle;
        var menuItems = this._sideBarMenuItems;
        var sideEnabled = headerTitle && menuItems;
        container.appendChild(this._createControl());

        if (sideEnabled)
            container.appendChild(this._createPanel(headerTitle, menuItems));

        bean.on(container, 'keyup', "#searchboxinput",

            debounce((e) => {
                let value = e.target.value;
                if (value.length === 0) {
                    this._clearSearchResult();
                }
                if (value.length < 2) {
                    return;
                }
                this._suggest(value)
            }, 300)
        );
        bean.on(container, 'click', "#searchboxinput", (e) => {
            this._showSearchResult();
        });

        bean.on(container, 'click', "#searchbox-searchbutton", debounce(() => {
            var value = document.querySelector("#searchboxinput").value;
            this._suggest(value);
        }, 300, {
                'leading': true,
                'trailing': false
            }));

        if (sideEnabled) {
            bean.on(container, 'click', "#searchbox-menubutton", function () {
                var panel = document.querySelector('.panel');
                panel.style.left = '0px';
            });
            bean.on(container, 'click', ".panel-close-button", function () {
                var panel = document.querySelector('.panel');
                panel.style.left = '-300px';
            });
        }

        bean.on(container, 'click', '.result-list-item a', (e) => {
            e.preventDefault();
            // lat lng
            map.panTo([parseFloat(e.target.dataset.y), parseFloat(e.target.dataset.x)]);
            this._hideSearchResult();
        })

        L.DomEvent.disableClickPropagation(container);
        return container;
    }

});

export default L.Control.SearchBox