import * as dns from 'node:dns';

export async function verifyDnsRecord(address: string, nonce: string) {
    const records = await dns.promises.resolveTxt(address);

    for (const record of records) {
        const [txt] = record;
        console.log("DNS TXT record found:", txt);
        if (txt === `hashcred=9f9e8a2a5c96915ebacd39ae18208689`) {
            return true;
        }
    }

    return false;
}
