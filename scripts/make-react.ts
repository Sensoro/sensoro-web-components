import 'zx/globals';
import prettier from '@umijs/utils/compiled/prettier';
import { PATHS } from './.internal/constants';
import { getAllComponents } from './utils';

const reactDir = path.join(PATHS.REACT, 'src');
const index: string[] = [];

(async () => {
  const metadata = JSON.parse(fs.readFileSync(path.join(PATHS.METADATA), 'utf8'));

  const components = getAllComponents(metadata);

  components.forEach(component => {
    if (!component.tagName) return;
    const tagWithoutPrefix = component.tagName.replace(/^l-/, '');
    const componentDir = path.join(reactDir, tagWithoutPrefix);
    const componentFile = path.join(componentDir, 'index.ts');
    const importPath = '@sensoro-design/web-components/es/' + component.path
    const events = (component.events || []).map((event: any) => `${event.reactName}: '${event.name}'`).join(',\n');

    fs.mkdirSync(componentDir, { recursive: true });

    const source = prettier.format(
      `
        import * as React from 'react';
        import { createComponent } from '@lit-labs/react';
        import Component from '${importPath}';

        export default createComponent({
          tagName: '${component.tagName}',
          elementClass: Component,
          react: React,
          events: {
            ${events}
          }
        });
      `,
      {
        parser: 'typescript',
      }
    );

    index.push(`export { default as ${component.name} } from './${tagWithoutPrefix}/index.js';`);

    fs.writeFileSync(componentFile, source, 'utf8');
  })

  // Generate the index file
  fs.writeFileSync(path.join(reactDir, 'index.ts'), index.join('\n'), 'utf8');
})();