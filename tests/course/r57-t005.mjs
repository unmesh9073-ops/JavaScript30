import { chromium } from 'playwright';
import { spawn } from 'child_process';
import assert from 'assert';

(async () => {
    const server = spawn('npx', ['http-server', '.', '-p', '8080'], { detached: true });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Force deterministic testing: block ALL external network requests
        await page.route('**/*', route => {
            const url = route.request().url();
            if (url.startsWith('http://localhost:8080')) {
                route.continue(); // Allow local server requests
            } else {
                route.abort(); // Block external requests (e.g., unsplash.it)
            }
        });

        await page.goto('http://localhost:8080/13%20-%20Slide%20in%20on%20Scroll/index-START.html');

        // Scroll to trigger the slide-in logic
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500); // Wait for scroll debounce and animation

        // Assert that the images successfully loaded locally without external dependencies
        const imagesLoaded = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('.slide-in'));
            return images.every(img => img.complete && img.naturalHeight !== 0);
        });

        assert.strictEqual(imagesLoaded, true, 'All images should load successfully from local deterministic fixtures');

        console.log('Success: All R57-T005 deterministic browser test assertions passed.');
        process.exit(0);
    } catch (error) {
        console.error('Assertion failure:', error);
        process.exit(1);
    } finally {
        await browser.close();
        process.kill(-server.pid);
    }
})();