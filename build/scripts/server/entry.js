(() => {
    const defines = {};
    const entry = [null];
    function define(name, dependencies, factory) {
        defines[name] = { dependencies, factory };
        entry[0] = name;
    }
    define("require", ["exports"], (exports) => {
        Object.defineProperty(exports, "__cjsModule", { value: true });
        Object.defineProperty(exports, "default", { value: (name) => resolve(name) });
    });
    define("system", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        checkApiLevel(1);
        exports.system = server.registerSystem(0, 0);
    });
    define("utils", ["require", "exports"], function (require, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        function isPlayerInfo(info) {
            return info.identifier === "minecraft:player";
        }
        exports.isPlayerInfo = isPlayerInfo;
    });
    define("main", ["require", "exports", "system", "utils"], function (require, exports, system_1, utils_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        system_1.system.initialize = function () {
            server.log("Teleport Addon Loaded");
            this.registerCommand("home", {
                description: "回家",
                permission: 0,
                overloads: [
                    {
                        parameters: [],
                        handler(origin) {
                            if (!origin.entity)
                                throw "Player required";
                            const info = this.actorInfo(origin.entity);
                            if (utils_1.isPlayerInfo(info)) {
                                const [x, y, z] = info.spawnPoint;
                                if (info.dim !== 0)
                                    throw "Cannot cross-dimension teleport";
                                if (x === 0 && y === -1 && z === 0)
                                    throw "No home found!";
                                this.openModalForm(origin.entity, JSON.stringify({
                                    type: "modal",
                                    title: "Teleport Menu",
                                    content: `Do you want to teleport to home(${x}, ${y}, ${z})`,
                                    button1: "Yes",
                                    button2: "No"
                                }))
                                    .then(sel => {
                                    if (JSON.parse(sel) === true) {
                                        this.invokeConsoleCommand("tp", `tp "${info.name}" ${x} ${y} ${z}`);
                                        this.invokeConsoleCommand("§ateleport", `tell "${info.name}" §a已回家`);
                                    }
                                })
                                    .catch(server.log);
                            }
                            else
                                throw "Failed to teleport";
                        }
                    }
                ]
            });
            this.registerCommand("sethome", {
                description: "设置家",
                permission: 0,
                overloads: [
                    {
                        parameters: [],
                        handler(origin) {
                            if (!origin.entity)
                                throw "Player required";
                            const info = this.actorInfo(origin.entity);
                            if (utils_1.isPlayerInfo(info)) {
                                const [x, y, z] = info.spawnPoint;
                                if (info.dim !== 0)
                                    throw "只能在主世界设置家";
                                if (x === 0 && y === -1 && z === 0)
                                    throw "No home found!";
                                this.openModalForm(origin.entity, JSON.stringify({
                                    type: "modal",
                                    title: "Teleport Menu",
                                    content: `你想把家设置在这里吗(${x}, ${y}, ${z})`,
                                    button1: "Yes",
                                    button2: "No"
                                }))
                                    .then(sel => {
                                    if (JSON.parse(sel) === true) {
                                        this.invokeConsoleCommand('sethome', `spawnpoint "${info.name}" ${x} ${y} ${z}`);
                                        this.invokeConsoleCommand("§ateleport", `tell "${info.name}" §a已成功为你设置家`);
                                    }
                                })
                                    .catch(server.log);
                            }
                            else
                                throw "设置家失败";
                        }
                    }
                ]
            });
            this.registerCommand("spawn", {
                description: "返回主城",
                permission: 0,
                overloads: [
                    {
                        parameters: [],
                        handler(origin) {
                            if (!origin.entity)
                                throw "Player required";
                            const info = this.actorInfo(origin.entity);
                            const world = this.worldInfo();
                            if (utils_1.isPlayerInfo(info)) {
                                const [x, y, z] = world.spawnPoint;
                                if (info.dim !== 0)
                                    throw "Cannot cross-dimension teleport";
                                if (y === 32767)
                                    throw "Cannot detect spawnpoint altitude, you need to use /setworldpoint at first";
                                this.openModalForm(origin.entity, JSON.stringify({
                                    type: "modal",
                                    title: "Teleport Menu",
                                    content: `Do you want to teleport to spawn(${x}, ${y}, ${z})`,
                                    button1: "Yes",
                                    button2: "No"
                                }))
                                    .then(sel => {
                                    if (JSON.parse(sel) === true) {
                                        const component = this.createComponent(origin.entity, "minecraft:position" /* Position */);
                                        Object.assign(component.data, { x, y, z });
                                        this.applyComponentChanges(origin.entity, component);
                                    }
                                })
                                    .catch(server.log);
                            }
                            else
                                throw "Failed to teleport";
                        }
                    }
                ]
            });
            this.registerCommand("tpa", {
                description: "请求传送到ta人那",
                permission: 0,
                overloads: [
                    {
                        parameters: [
                            {
                                type: "player-selector",
                                name: "target"
                            },
                            {
                                type: "message",
                                name: "message",
                                optional: true
                            }
                        ],
                        handler(origin, [players, msg]) {
                            if (!origin.entity ||
                                origin.entity.__identifier__ !== "minecraft:player")
                                throw "Player required";
                            if (players.length !== 1)
                                throw `Cannot teleport to ${players.length} target(s)`;
                            const info = this.actorInfo(origin.entity);
                            if (!info)
                                throw `Cannot found actor info`;
                            const target = players[0];
                            const targetinfo = this.actorInfo(target);
                            if (targetinfo.dim != info.dim) {
                                this.openModalForm(target, JSON.stringify({
                                    type: "modal",
                                    title: "Teleport failed",
                                    content: "Cannot teleport cross the dimensions",
                                    button1: "Ok",
                                    button2: "Cancel"
                                }));
                                return;
                            }
                            this.openModalForm(target, JSON.stringify({
                                type: "modal",
                                title: "Teleport Request",
                                content: `${info.name} 想要传送到你这: ${msg}`,
                                button1: "Yes",
                                button2: "No"
                            }))
                                .then(sel => {
                                if (JSON.parse(sel) === true) {
                                    let sourceName = info.name;
                                    let targetName = targetinfo.name;
                                    this.invokeConsoleCommand("tp", `tp "${sourceName}" "${targetName}"`);
                                }
                            })
                                .catch(server.log);
                        }
                    }
                ]
            });
            this.registerCommand("tpahere", {
                description: "邀请他人传送到你这",
                permission: 0,
                overloads: [
                    {
                        parameters: [
                            {
                                type: "player-selector",
                                name: "target"
                            },
                            {
                                type: "message",
                                name: "message",
                                optional: true
                            }
                        ],
                        handler(origin, [players, msg]) {
                            if (!origin.entity ||
                                origin.entity.__identifier__ !== "minecraft:player")
                                throw "Player required";
                            if (players.length !== 1)
                                throw `Cannot teleport to ${players.length} target(s)`;
                            const info = this.actorInfo(origin.entity);
                            if (!info)
                                throw `Cannot found actor info`;
                            const target = players[0];
                            const targetinfo = this.actorInfo(target);
                            if (targetinfo.dim != info.dim) {
                                this.openModalForm(target, JSON.stringify({
                                    type: "modal",
                                    title: "Teleport failed",
                                    content: "Cannot teleport cross the dimensions",
                                    button1: "Ok",
                                    button2: "Cancel"
                                }));
                                return;
                            }
                            this.openModalForm(target, JSON.stringify({
                                type: "modal",
                                title: "Teleport Request",
                                content: `${info.name}邀请你传送到ta那:${msg}`,
                                button1: "Yes",
                                button2: "No"
                            }))
                                .then(sel => {
                                if (JSON.parse(sel) === true) {
                                    let targetName = targetinfo.name;
                                    let sourceName = info.name;
                                    //let sourcePos:string = getPositionofEntity(origin.entity);
                                    this.invokeConsoleCommand("tp", `tp "${targetName}" "${sourceName}"`);
                                }
                            })
                                .catch(server.log);
                        }
                    }
                ]
            });
        };
        function getPositionofEntity(entity) {
            let position;
            if (system_1.system.hasComponent(entity, "minecraft:position")) {
                let comp = system_1.system.getComponent(entity, "minecraft:position" /* Position */);
                position = comp.data.x.toFixed(0) + " " + comp.data.y.toFixed(0) + " " + comp.data.z.toFixed(0);
            }
            else {
                position = "无法获得坐标";
            }
            return position;
        }
    });
    
    'marker:resolver';

    function get_define(name) {
        if (defines[name]) {
            return defines[name];
        }
        else if (defines[name + '/index']) {
            return defines[name + '/index'];
        }
        else {
            const dependencies = ['exports'];
            const factory = (exports) => {
                try {
                    Object.defineProperty(exports, "__cjsModule", { value: true });
                    Object.defineProperty(exports, "default", { value: require(name) });
                }
                catch (_a) {
                    throw Error(['module "', name, '" not found.'].join(''));
                }
            };
            return { dependencies, factory };
        }
    }
    const instances = {};
    function resolve(name) {
        if (instances[name]) {
            return instances[name];
        }
        if (name === 'exports') {
            return {};
        }
        const define = get_define(name);
        instances[name] = {};
        const dependencies = define.dependencies.map(name => resolve(name));
        define.factory(...dependencies);
        const exports = dependencies[define.dependencies.indexOf('exports')];
        instances[name] = (exports['__cjsModule']) ? exports.default : exports;
        return instances[name];
    }
    if (entry[0] !== null) {
        return resolve("main");
    }
})();