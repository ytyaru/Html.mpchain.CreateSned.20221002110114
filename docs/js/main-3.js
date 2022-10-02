window.addEventListener('DOMContentLoaded', async(event) => {
    const throttle = new Throttle()
    const observable = new Observable()
    observable.subscribe(createSend)
    for (const id of ['from', 'to', 'quantity', 'fee-per-kb']) { 
        document.getElementById(id).addEventListener('input', async(event) => {
            observable.notify({ id: event.target.id, value: event.target.value })
        })
    }
    function createSend(d=null) {
        const ids = ['from', 'to', 'quantity', 'fee-per-kb']
        const values = ids.map(id=>document.getElementById(id).value)
        if (d) { values[ids.find(id=>id === d.id)] = d.value }
        throttle.run(async()=>{
            document.querySelector(`#result`).value = JSON.stringify(
                await Mpchain.createSend(...values))
        })
    }
    observable.notify()
});
window.addEventListener('beforeunload', async(event) => {
    console.log('beforeunload!!');
});

