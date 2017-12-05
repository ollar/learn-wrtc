const colours = {
  aqua: '#7FDBFF',
  blue: '#0074D9',
  navy:  '#001F3F',
  teal:  '#39CCCC',
  green: '#2ECC40',
  olive: '#3D9970',
  lime:  '#01FF70',

  yellow:  '#FFDC00',
  orange:  '#FF851B',
  red:     '#FF4136',
  fuchsia: '#F012BE',
  purple:  '#B10DC9',
  maroon:  '#85144B',

  white:  '#FFFFFF',
  silver: '#DDDDDD',
  gray:   '#AAAAAA',
  black: '#111111',
};

export default function template(data) {
    return `
        <form class="test">
          <div>
            <input name="username">
          </div>

          <div>
          <select name="colour">
            ${_.map(colours, (key, value) => `<option value="${key}">${value}</option>`).join('')}
          </select>
          </div>

          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
    `;
}
