import { Request, Response } from 'express'
import puppeteer from 'puppeteer';

export default class Social {
    static async getAll(req: Request, res: Response) {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        try {
            await page.goto('https://www.instagram.com/fatecindaiatuba/').catch(() => { });

            const dataRaw = await page.waitForSelector(`div ._aagv`).then((res) => {
                return res?.evaluate(val => val);
            }).catch(() => (''));

            await browser.close();

            return res.status(200).json({ data: dataRaw });
        } catch (error) {
            console.log(error);
            return res.status(400).json({ error: 'Não foi possível resgatar os dados' });
        } finally {
            browser.close();
        }
    }
}
