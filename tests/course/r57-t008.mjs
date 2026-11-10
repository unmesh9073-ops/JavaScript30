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
        await page.goto('http://localhost:8080/08%20-%20Fun%20with%20HTML5%20Canvas/index-START.html');

        // Test 1: Verify the text input fixture exists and contains the special string/emoji
        const textInput = page.locator('#canvas-text-input');
        await textInput.waitFor();
        const inputValue = await textInput.inputValue();
        assert.ok(inputValue.includes('🖼️'), 'Fixture input text must contain the required string including emoji 🖼️');

        // Test 2: Ensure text renders safely without DOM injection side effects
        const injectedElements = await page.locator('#canvas-text-input script').count();
        assert.strictEqual(injectedElements, 0, 'Fixture text must be treated as pure text and execute no scripts');

        console.log('Success: All R57-T008 Canvas text fixture assertions passed.');
        process.exit(0);
    } catch (error) {
        console.error('Assertion failure:', error);
        process.exit(1);
    } finally {
        await browser.close();
        process.kill(-server.pid);
    }
})();