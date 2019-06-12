import $ from 'jquery';

/*
  Define space options, used to alter options to this space
*/
class SpaceOptions {
    constructor($options, space) {
        this.$options = $options;
        this.$options.on('mousedown', e => e.stopPropagation());
        this.$options.on('dblclick', e => e.stopPropagation());
        this.$options.on('keydown', e => e.stopPropagation());
        this.$options.on('touchstart', e => e.stopPropagation());
        this.$options.on('wheel', e => e.stopPropagation());
        this.space = space;
        this.options = {};
    }

    addSlider(name, defVal, onChange) {
        const optionId = ~~(Math.random() * 100000000)
        const $option = $(`
  <div class="container-fluid option">

  <div class="row clearfix">
  <label class="col-md-3">
  ${name}
  </label>
  <div class="col-md-9 input">
  <input type="range" min="0" max="100" name="${optionId}" value="1" autocomplete="off" />
  </div>
  </div>

  <div class="row clearfix">
  <div class="col-md-9 value"></div>
  <div class="col-md-3"><button class="btn btn-default default">Default</div>
  </div>

  </div>
  `);

        const $input = $option.find('input');
        const $value = $option.find('.value');
        const $default = $option.find('.default');
        const onChange2 = () => {
            const params = onChange($input, this.space);

            $value.html(params.value);
        };

        $input.on('change', onChange2);

        $default.on('click', () => {
            $input.val(defVal);
            onChange2();
        });

        this.$options.append($option);
    }

    addSelectize(name, defVal, onChange, options = [], settings = {}) {
        const optionId = ~~(Math.random() * 100000000)
        const $option = $(`
  <div class="container-fluid option">

  <div class="row clearfix">
  <label class="col-md-3">
  ${name}
  </label>
  <div class="col-md-9 input">
  <select name="${optionId}" autocomplete="off">
  ${options.map(e => `<option value="${e.value}">${e.text}</option>`).join('')}
  </select>
  </div>
  </div>

  <div class="row clearfix">
  <div class="col-md-9 value"></div>
  <div class="col-md-3"><button class="btn btn-default default">Default</div>
  </div>

  </div>
  `);
        const $input = $option.find('select');
        const $value = $option.find('.value');
        const $default = $option.find('.default');
        const onChange2 = () => {
            const params = onChange($input, this.space);

            $value.html(params.value);
        };

        $input.selectize(settings);
        $input[0].selectize.on('change', onChange2);

        $default.on('click', () => {
            $input[0].selectize.setValue(defVal);
        });

        this.$options.append($option);
    }
}

export default SpaceOptions;
