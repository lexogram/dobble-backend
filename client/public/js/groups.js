/**
 * groups.js
 *
 */

const groupName = document.getElementById("group-name")
const membersList = document.getElementById("group-members")


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
  const innerHTML = Object.entries(members)
  .sort(byUserName)
  .reduce(
    ( html, [ user_name, id ] ) => {
      html += `<li>
        <label for="${id}">
          <input
            id="${id}"
            type="checkbox"
            value=${id}
            ${id === user_id ? "disabled" : ""}
          />
          <span>${user_name}</span
        </label>
      </li>`

      return html
    },
  "")
  membersList.innerHTML = innerHTML
}