window.addEventListener('DOMContentLoaded', async(event) => {
    console.log('DOMContentLoaded!!');
    let timeoutId = 0
    document.querySelector(`#from`).addEventListener('input', async(event) => {
        createSend(
            event.target.value,
            document.querySelector(`#to`).value,
            parseInt(document.querySelector(`#quantity`).value),
            parseInt(document.querySelector(`#fee-per-kb`).value))
    })
    document.querySelector(`#to`).addEventListener('input', async(event) => {
        createSend(
            document.querySelector(`#from`).value,
            event.target.value,
            parseInt(document.querySelector(`#quantity`).value),
            parseInt(document.querySelector(`#fee-per-kb`).value))
    })
    document.querySelector(`#quantity`).addEventListener('input', async(event) => {
        createSend(
            document.querySelector(`#from`).value,
            document.querySelector(`#to`).value,
            parseInt(event.target.value),
            parseInt(document.querySelector(`#fee-per-kb`).value))
    })
    document.querySelector(`#fee-per-kb`).addEventListener('input', async(event) => {
        createSend(
            document.querySelector(`#from`).value,
            document.querySelector(`#to`).value,
            parseInt(document.querySelector(`#quantity`).value),
            parseInt(event.target.value))
    })
    createSend(
        document.querySelector(`#from`).value,
        document.querySelector(`#to`).value,
        parseInt(document.querySelector(`#quantity`).value),
        parseInt(document.querySelector(`#fee-per-kb`).value))
    function createSend(from, to, quantity, feePerKb) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async()=>{
            document.querySelector(`#result`).value = JSON.stringify(await Mpchain.createSend(from, to, quantity, feePerKb))
        }, 1000);
    }
});
window.addEventListener('beforeunload', async(event) => {
    console.log('beforeunload!!');
});

