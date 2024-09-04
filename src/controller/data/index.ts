import { Request, Response } from 'express'
import puppeteer from "puppeteer";

export default class Data {
    static async get(req: Request, res: Response) {
        const { user, pass } = req.body;

        if (!user || !pass) return res.status(400).json({ error: "Preencha todos os campos" });

        const url = 'https://siga.cps.sp.gov.br/aluno/login.aspx?'

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle2' });

        const credential = { user: user, pass: pass }
        //user: bcrypt.hashSync(user, 10), pass: bcrypt.hashSync(pass, 10)

        const nameInput = '#vSIS_USUARIOID';
        await page.type(nameInput, credential.user);

        const passInput = '#vSIS_USUARIOSENHA'
        await page.type(passInput, credential.pass);

        const confirmButton = 'BTCONFIRMA'
        await page.click(`input[name=${confirmButton}]`).catch(e => {
            console.log(e);
        });

        const result = await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).then(() => {
            return '';
        }).catch(async () => {
            const resultId = 'span_vSAIDA';
            const result = await page.waitForSelector(`#${resultId}`).then((res) => {
                return res?.evaluate(val => val.querySelector('text')?.textContent);
            }).catch(() => {});

            return result ?? 'Problema com a conexão';
        });

        //In case of some error occurred
        if(result) return res.status(400).json({response: result});

        await page.locator('.PopupHeaderButton').click();

        const raId = 'span_MPW0041vACD_ALUNOCURSOREGISTROACADEMICOCURSO';
        const ra = await page.waitForSelector(`span #${raId}`).then((res) => {
            return res?.evaluate(val => val.textContent);
        });

        const nameId = 'span_MPW0041vPRO_PESSOALNOME';
        const name = await page.waitForSelector(`div #${nameId}`).then((res) => {
            return res?.evaluate(val => val.textContent?.substring(0, val.textContent?.lastIndexOf(' ')));
        });

        const emailId = 'span_MPW0041vINSTITUCIONALFATEC'
        const email = await page.waitForSelector(`div #${emailId}`).then((res) => {
            return res?.evaluate(val => val.textContent);
        });

        const imageId = 'MPW0041FOTO'
        const image = await page.waitForSelector(`div #${imageId}`).then((res) => {
            return res?.evaluate(val => val.querySelector('img')?.getAttribute('src'));
        });

        await browser.close();

        return res.status(200).json({ ra: ra, name: name, email: email, picture: image });
    }
}