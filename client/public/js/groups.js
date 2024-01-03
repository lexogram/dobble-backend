/**
 * groups.js
 *
 */

const groupName = document.querySelector(".group-name")
const membersList = document.querySelector(".group-members")


const byUserName = (a, b) => {
  if (a[1] === user_id) {
    return -1
  } else if (b[1] === user_id) {
    return 1
  } else {
    return a[0] > b[0] ? 1 : 0
  }
}


const updateGroupMembers = ({ group, members }) => {
  groupName.textContent = group
  members = Object.entries(members)
  let innerHTML = members
  .sort(byUserName)
  .reduce(
    ( html, [ user_name, id ] ) => {
      html += `<li>
        <label for="${id}">
          <input
            id="${id}"
            type="checkbox"
            value=${id}
            checked
            ${id === user_id ? "disabled" : ""}
          />
          <span>${user_name}</span
        </label>
      </li>`

      return html
    },
  "")

  if (members.length < 2) {
    innerHTML += `<li class="center">(No-one else is here)</li>`
  }
  membersList.innerHTML = innerHTML

  const maxHeight = Math.max(2, Math.min(4, members.length))
                  * 1.8 + 0.5 + "em"

  document.body.style.setProperty( "--ul-height", maxHeight )
}