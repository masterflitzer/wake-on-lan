import type { WoL } from "./types.js";

const title = document.querySelector("#title");
const container = document.querySelector("#container");
const template = document.querySelector(
    "#wol-target"
) as HTMLTemplateElement | null;

if (title != null) {
    title.textContent = document.title;
}

const json = await fetch("/api");
const data: WoL[] = await json.json();

if (container !== null) {
    if (template != null) {
        for (const wol of data) {
            const clone = template.content.cloneNode(true) as Element | null;
            if (clone != null) {
                const name = clone.querySelector(".name");
                const mac = clone.querySelector(".mac");
                if (name != null && mac != null) {
                    name.textContent = wol.name;
                    mac.textContent = wol.mac;
                    container.appendChild(clone);
                }
            }
        }
        container
            .querySelectorAll(".wol")
            .forEach((x) => x.addEventListener("click", wake));
    }
}

async function wake(event: Event) {
    const target = event.currentTarget as Element | null;
    if (target == null) {
        alert("An unexpected error occurred!");
        throw new Error("currentTarget was null");
    }
    const mac = target.querySelector(".mac");
    if (mac != null) {
        await fetch("/api", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ mac }),
        });
    }
}
