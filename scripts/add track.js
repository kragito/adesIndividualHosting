function add(){
    let tracking = `<div class="track">
            <button class="close">X</button>
            <form action="get">
                <label for="companyid">Company ID</label>
                <input type="text" id="companyid">

                <button type="submit">Search</button><br>
            </form>
            <label for="queueid">Queue ID</label>
            <select name="queueid" id="queueid">
                <option value="1">hello</option>
            </select>

            <label for="hide">Hide inactive</label>
            <input type="checkbox" name="hide" id="hide">
        </div>`
    document.getElementById("add").insertAdjacentHTML("beforebegin", tracking)
    console.log("Add new tracking")
}
