window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    let timeoutId = 0
    document.querySelector(`#from`).addEventListener('input', async(event) => {
        document.querySelector(`#result`).value = JSON.stringify(await Mpchain.createSend(
            event.target.value,
            document.querySelector(`#to`).value,
            parseInt(document.querySelector(`#quantity`).value),
            parseInt(document.querySelector(`#fee-per-kb`).value)))
    })
    document.querySelector(`#to`).addEventListener('input', async(event) => {
        document.querySelector(`#result`).value = JSON.stringify(await Mpchain.createSend(
            document.querySelector(`#from`).value,
            event.target.value,
            parseInt(document.querySelector(`#quantity`).value),
            parseInt(document.querySelector(`#fee-per-kb`).value)))
    })
    document.querySelector(`#quantity`).addEventListener('input', async(event) => {
        document.querySelector(`#result`).value = JSON.stringify(await Mpchain.createSend(
            document.querySelector(`#from`).value,
            document.querySelector(`#to`).value,
            parseInt(event.target.value),
            parseInt(document.querySelector(`#fee-per-kb`).value)))
    })
    document.querySelector(`#fee-per-kb`).addEventListener('input', async(event) => {
        document.querySelector(`#result`).value = JSON.stringify(await Mpchain.createSend(
            document.querySelector(`#from`).value,
            document.querySelector(`#to`).value,
            parseInt(document.querySelector(`#quantity`).value),
            parseInt(event.target.value)))
    })
    document.querySelector(`#result`).value = JSON.stringify(await Mpchain.createSend(
        document.querySelector(`#from`).value,
        document.querySelector(`#to`).value,
        parseInt(document.querySelector(`#quantity`).value),
        parseInt(document.querySelector(`#fee-per-kb`).value)))
});
window.addEventListener('beforeunload', async(event) => {
    console.log('beforeunload!!');
});

