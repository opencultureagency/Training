(function ($) {

  // Shuffle 

  var Shuffle = window.Shuffle;

  class Demo {
      constructor(element) {
          this.element = element;
          this.difficulties = Array.from(document.querySelectorAll('.filter-difficulty button'));
          this.participants = Array.from(document.querySelectorAll('.filter-participant button'));
          this.tags = Array.from(document.querySelectorAll('.filter-tag button'));
          this.reset = Array.from(document.querySelectorAll('.filter-reset'));
          this.shuffle = new Shuffle(element, {
              itemSelector: '.module-item',
              sizer: element.querySelector('.my-sizer-element'),
          });

          // Log events.
          //this.addShuffleEventListeners();

          this.filters = {
              difficulties: [],
              participants: [],
              tags: [],
          };

          this._bindEventListeners();
          this.addSorting();
          this.addSearchFilter();

          // CHANGE: Initial random display – ONLY ONCE
          // Important: after initialization, before user interaction
          requestAnimationFrame(() => {
              this.shuffle.sort({ randomize: true });
          });
      }

      /**
       * Shuffle uses the CustomEvent constructor to dispatch events.
       */
      addShuffleEventListeners() {
          this.shuffle.on(Shuffle.EventType.LAYOUT, (data) => {
              console.log('layout. data:', data);
          });
          this.shuffle.on(Shuffle.EventType.REMOVED, (data) => {
              console.log('removed. data:', data);
          });
      }

      /**
       * Bind event listeners for when the filters change.
       */
      _bindEventListeners = function () {
          this._onDifficultyChange = this._handleDifficultyChange.bind(this);
          this._onParticipantChange = this._handleParticipantChange.bind(this);
          this._onTagChange = this._handleTagChange.bind(this);
          this._onResetClick = this._resetFilters.bind(this);

          this.difficulties.forEach(function (button) {
              button.addEventListener('click', this._onDifficultyChange);
          }, this);

          this.tags.forEach(function (button) {
              button.addEventListener('click', this._onTagChange);
          }, this);

          this.participants.forEach(function (button) {
              button.addEventListener('click', this._onParticipantChange);
          }, this);

          this.reset.forEach(function (button) {
              button.addEventListener('click', this._onResetClick);
          }, this);
      };

      _getCurrentDifficultyFilters = function () {
          return this.difficulties
              .filter(btn => btn.classList.contains('active'))
              .map(btn => btn.getAttribute('data-difficulty'));
      };

      _getCurrentTagFilters = function () {
          return this.tags
              .filter(btn => btn.classList.contains('active'))
              .map(btn => btn.getAttribute('data-tag'));
      };

      _getCurrentParticipantFilters = function () {
          return this.participants
              .filter(btn => btn.classList.contains('active'))
              .map(btn => btn.getAttribute('data-participant'));
      };

      _resetFilters = function () {
          var allFilterButtons = Array.from(
              document.querySelectorAll(
                  '.filter-difficulty button, .filter-tag button, .filter-participant button'
              )
          );

          allFilterButtons.forEach(btn => btn.classList.remove('active'));

          this.filters.difficulties = [];
          this.filters.participants = [];
          this.filters.tags = [];

          this.filter();
      };

      _handleDifficultyChange = function (evt) {
          const button = evt.currentTarget;
          const value = button.dataset.difficulty;

          if (value === 'All') {
              this.difficulties.forEach(btn => btn.classList.remove('active'));
          } else {
              button.classList.toggle('active');
          }

          this.filters.difficulties = this._getCurrentDifficultyFilters();
          this.filter();
      };

      _handleTagChange = function (evt) {
          const button = evt.currentTarget;
          const value = button.dataset.tag;

          if (value === 'All') {
              this.tags.forEach(btn => btn.classList.remove('active'));
          } else {
              button.classList.toggle('active');
          }

          this.filters.tags = this._getCurrentTagFilters();
          this.filter();
      };

      _handleParticipantChange = function (evt) {
          const button = evt.currentTarget;
          const value = button.dataset.participant;

          if (value === 'All') {
              this.participants.forEach(btn => btn.classList.remove('active'));
          } else {
              this.participants.forEach(btn => btn.classList.remove('active'));
              button.classList.add('active');
          }

          this.filters.participants = this._getCurrentParticipantFilters();
          this.filter();
      };

      filter = function () {
          if (this.hasActiveFilters()) {
              this.shuffle.filter(this.itemPassesFilters.bind(this));
          } else {
              this.shuffle.filter(Shuffle.ALL_ITEMS);
          }
      };

      hasActiveFilters = function () {
          return Object.values(this.filters).some(arr => arr.length > 0);
      };

      itemPassesFilters = function (element) {
          const difficulties = this.filters.difficulties;
          const participants = this.filters.participants;
          const tags = this.filters.tags;

          const itemDifficulties = JSON.parse(element.dataset.difficulties);
          const itemParticipants = JSON.parse(element.dataset.participants);
          const itemTags = element.dataset.tags.split(',').map(t => t.trim());

          if (difficulties.length && !difficulties.some(d => itemDifficulties.includes(d))) return false;
          if (participants.length && !participants.some(p => itemParticipants.includes(p))) return false;
          if (tags.length && !tags.some(t => itemTags.includes(t))) return false;

          return true;
      };

      addSorting() {
          const buttonGroup = document.querySelector('.sort-options');
          if (!buttonGroup) return;
          buttonGroup.addEventListener('change', this._handleSortChange.bind(this));
      }

      _handleSortChange(evt) {
          const { value } = evt.target;
          let options = null;

          if (value === 'date-created') {
              options = {
                  reverse: true,
                  by: el => el.getAttribute('data-created'),
              };
          } else if (value === 'title') {
              options = {
                  by: el => el.getAttribute('data-title').toLowerCase(),
              };
          }

          // CHANGE: Only sort if options actually exist
          if (options) {
              this.shuffle.sort(options);
          }
      }

      addSearchFilter() {
          const searchInput = document.querySelector('.js-shuffle-search');
          const clearSearch = document.getElementById('reset-search');
          if (!searchInput) return;

          searchInput.addEventListener('keyup', this._handleSearchKeyup.bind(this));
          clearSearch.addEventListener('click', this._clearSearch.bind(this));
      }

      _handleSearchKeyup(evt) {
          const searchText = evt.target.value.toLowerCase();

          this.shuffle.filter(element => {
              const title = element.dataset.name.toLowerCase();
              const description = element.dataset.description.toLowerCase();
              return title.includes(searchText) || description.includes(searchText);
          });
      }

      _clearSearch() {
          const searchInput = document.querySelector('.js-shuffle-search');
          searchInput.value = '';
          this.filter();
      }
  }

  document.addEventListener('DOMContentLoaded', function () {
      new Demo(document.querySelector('.my-shuffle-container'));
  });

})(jQuery);