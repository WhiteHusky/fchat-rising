/* tslint:disable:quotemark */

import { domain } from '../bbcode/core';

export interface ImagePreviewMutatorCollection {
    [key: string]: string;
}

export class ImagePreviewMutator {
    private mutators: ImagePreviewMutatorCollection = {};

    constructor() {
        this.init();
    }

    getMutatorJsForSite(url: string): string | undefined {
        const urlDomain = domain(url);

        if (!urlDomain)
            return;

        console.log('Domain is', urlDomain);

        const mutatorJs = this.mutators[urlDomain];

        if (!mutatorJs)
            return;

        return `(() => { try { ${mutatorJs} } catch (err) { console.error(err); } })()`;
    }

    protected add(domain: string, mutatorJs: string) {
        this.mutators[domain] = mutatorJs;
    }

    protected init() {
        this.add('e621.net', this.getBaseJsMutatorScript('#image'));
        this.add('e-hentai.org', this.getBaseJsMutatorScript('#img'));
        this.add('gelbooru.com', this.getBaseJsMutatorScript('#image'));
        this.add('chan.sankakucomplex.com', this.getBaseJsMutatorScript('#image'));

        this.add(
            'gfycat.com',
            `${this.getBaseJsMutatorScript('video')}
            document.querySelector('video').play();
            `
        );

        this.add(
            'imgur.com',
            `
                const imageCount = $('.post-image-container').length;

                ${this.getBaseJsMutatorScript('.image.post-image img, .image.post-image video')}

                if(imageCount > 1)
                    $('#flistWrapper').append('<div id="imageCount" style="position: absolute; bottom: 0; right: 0; background: green; border: 2px solid lightgreen; width: 5rem; height: 5rem; font-size: 2rem; font-weight: bold; color: white; border-radius: 5rem; margin: 0.75rem;"><div style="position: absolute; top: 50%; left: 50%; transform: translateY(-50%) translateX(-50%);">+' + (imageCount - 1) + '</div></div>');
            `

            // "$('#topbar').hide();"
            // + "$('.post-header').hide();"
            // + "$('#inside').css({padding: 0, margin: 0, width: '100%'});"
            // + "$('#right-content').hide();"
            // + "$('.post-container').css({width: '100%'});"
            // + "$('.post-image img').css({width: 'auto', 'min-height': 'unset', 'max-height': '100vh'});"
            // + "$('#recommendations').hide();"
            // + "$('.left').css({float: 'none'});"
            // + "$('body').css({overflow: 'hidden'});"
            // + "const imageCount = $('.post-image-container').length;"
            // + "if(imageCount > 1) {"
            //     + "$('body').append('<div id=\"imageCount\" style=\"position: absolute; bottom: 0; right: 0; background: green; border: 2px solid lightgreen; width: 5rem; height: 5rem; font-size: 2rem; font-weight: bold; color: white; border-radius: 5rem; margin: 0.75rem;\"><div style=\"position: absolute; top: 50%; left: 50%; transform: translateY(-50%) translateX(-50%);\">+' + (imageCount - 1) + '</div></div>');"
            // + "}"
        );

        this.add(
            'rule34.xxx',
            `${this.getBaseJsMutatorScript('#image')}
                const content = document.querySelector('#content');
                content.remove();
            `
        );
    }

    getBaseJsMutatorScript(imageSelector: string): string {
        return `const body = document.querySelector('body');
            const img = document.querySelector('${imageSelector}');
            const el = document.createElement('div');
            el.id = 'flistWrapper';

            el.style = 'width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 100000; '
                + 'background-color: black; background-size: contain; background-repeat: no-repeat; background-position: top left;';

            img.remove();
            el.append(img);
            body.append(el);
            body.style = 'padding: 0; margin: 0; overflow: hidden; width: 100%; height: 100%';
            img.style = 'object-position: top left; object-fit: contain; width: 100%; height: 100%;'
        `;
    }

}
