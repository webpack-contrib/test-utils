/* eslint-disable
import/prefer-default-export
*/
import { JSDOM, VirtualConsole } from 'jsdom';

const html = (scripts) => `
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
    <div id="root"></div>

    ${scripts.map((script) => `<script>${script}</script>`).join('\n')}
  </body>
</html>`;

const virtualConsole = new VirtualConsole().sendTo(console);

export function dom(scripts) {
  return new JSDOM(html(scripts), {
    runScripts: 'dangerously',
    virtualConsole,
  });
}
