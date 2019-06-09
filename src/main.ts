import { system, MySystem } from "./system";
import { isPlayerInfo } from "./utils";

system.initialize = function() {
  server.log("Teleport Addon Loaded");
  this.registerCommand("home", {
    description: "回家",
    permission: 0,
    overloads: [
      {
        parameters: [],
        handler(origin) {
          if (!origin.entity) throw "Player required";
          const info = this.actorInfo(origin.entity);
          if (isPlayerInfo(info)) {
            const [x, y, z] = info.spawnPoint;
            if (info.dim !== 0) throw "Cannot cross-dimension teleport";
            if (x === 0 && y === -1 && z === 0) throw "No home found!";
            this.openModalForm(
              origin.entity,
              JSON.stringify({
                type: "modal",
                title: "Teleport Menu",
                content: `Do you want to teleport to home(${x}, ${y}, ${z})`,
                button1: "Yes",
                button2: "No"
              })
            )
              .then(sel => {
                if (JSON.parse(sel) === true) {
                  this.invokeConsoleCommand("tp",`tp ${info.name} ${x} ${y} ${z}`)
                  this.invokeConsoleCommand("§ateleport",`tell ${info.name} §a已回家`);
                }
              })
              .catch(server.log);
          } else throw "Failed to teleport";
        }
      } as CommandOverload<MySystem, []>
    ]
  });

  this.registerCommand("sethome", {
    description: "设置家",
    permission: 0,
    overloads: [
      {
        parameters: [],
        handler(origin) {
          if (!origin.entity) throw "Player required";
          const info = this.actorInfo(origin.entity);
          if (isPlayerInfo(info)) {
            const [x, y, z] = info.spawnPoint;
            if (info.dim !== 0) throw "只能在主世界设置家";
            if (x === 0 && y === -1 && z === 0) throw "No home found!";
            this.openModalForm(
              origin.entity,
              JSON.stringify({
                type: "modal",
                title: "Teleport Menu",
                content: `你想把家设置在这里吗(${x}, ${y}, ${z})`,
                button1: "Yes",
                button2: "No"
              })
            )
              .then(sel => {
                if (JSON.parse(sel) === true) {
                    this.invokeConsoleCommand('sethome',`spawnpoint ${info.name} ${x} ${y} ${z}`);
                    this.invokeConsoleCommand("§ateleport",`tell ${info.name} §a已成功为你设置家`);
                }
              })
              .catch(server.log);
          } else throw "设置家失败";
        }
      } as CommandOverload<MySystem, []>
    ]
  });


  this.registerCommand("spawn", {
    description: "返回主城",
    permission: 0,
    overloads: [
      {
        parameters: [],
        handler(origin) {
          if (!origin.entity) throw "Player required";
          const info = this.actorInfo(origin.entity);
          const world = this.worldInfo();
          if (isPlayerInfo(info)) {
            const [x, y, z] = world.spawnPoint;
            if (info.dim !== 0) throw "Cannot cross-dimension teleport";
            if (y === 32767)
              throw "Cannot detect spawnpoint altitude, you need to use /setworldpoint at first";
            this.openModalForm(
              origin.entity,
              JSON.stringify({
                type: "modal",
                title: "Teleport Menu",
                content: `Do you want to teleport to spawn(${x}, ${y}, ${z})`,
                button1: "Yes",
                button2: "No"
              })
            )
              .then(sel => {
                if (JSON.parse(sel) === true) {
                  const component = this.createComponent(
                    origin.entity,
                    MinecraftComponent.Position
                  );
                  Object.assign(component.data, { x, y, z });
                  this.applyComponentChanges(origin.entity, component);
                }
              })
              .catch(server.log);
          } else throw "Failed to teleport";
        }
      } as CommandOverload<MySystem, []>
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
          if (
            !origin.entity ||
            origin.entity.__identifier__ !== "minecraft:player"
          )
            throw "Player required";
          if (players.length !== 1)
            throw `Cannot teleport to ${players.length} target(s)`;
          const info = this.actorInfo(origin.entity) as PlayerInfo;
          if (!info) throw `Cannot found actor info`;
          const target = players[0];
          const targetinfo = this.actorInfo(target) as PlayerInfo;
          if (targetinfo.dim != info.dim) {
            this.openModalForm(
              target,
              JSON.stringify({
                type: "modal",
                title: "Teleport failed",
                content: "Cannot teleport cross the dimensions",
                button1: "Ok",
                button2: "Cancel"
              })
            );
            return;
          }
          this.openModalForm(
            target,
            JSON.stringify({
              type: "modal",
              title: "Teleport Request",
              content: `${info.name} 想要传送到你这: ${msg}`,
              button1: "Yes",
              button2: "No"
            })
          )
            .then(sel => {
              if (JSON.parse(sel) === true) {
                  let sourceName = info.name;
                  let targetName = targetinfo.name;
                  this.invokeConsoleCommand("tp",`tp ${sourceName} ${targetName}`);
              }
            })
            .catch(server.log);
        }
      } as CommandOverload<MySystem, ["player-selector", "message"]>
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
          if (
            !origin.entity ||
            origin.entity.__identifier__ !== "minecraft:player"
          )
            throw "Player required";
          if (players.length !== 1)
            throw `Cannot teleport to ${players.length} target(s)`;
          const info = this.actorInfo(origin.entity) as PlayerInfo;
          if (!info) throw `Cannot found actor info`;
          const target = players[0];
          const targetinfo = this.actorInfo(target) as PlayerInfo;
          if (targetinfo.dim != info.dim) {
            this.openModalForm(
              target,
              JSON.stringify({
                type: "modal",
                title: "Teleport failed",
                content: "Cannot teleport cross the dimensions",
                button1: "Ok",
                button2: "Cancel"
              })
            );
            return;
          }
          this.openModalForm(
            target,
            JSON.stringify({
              type: "modal",
              title: "Teleport Request",
              content: `${info.name}邀请你传送到ta那:${msg}`,
              button1: "Yes",
              button2: "No"
            })
          )
            .then(sel => {
              if (JSON.parse(sel) === true) {
                let targetName = targetinfo.name;
                let sourceName = info.name;
                //let sourcePos:string = getPositionofEntity(origin.entity);
                this.invokeConsoleCommand("tp",`tp ${targetName} ${sourceName}`);
              }
            })
            .catch(server.log);
        }
      } as CommandOverload<MySystem, ["player-selector", "message"]>
    ]
  });
};

function getPositionofEntity(entity: IEntity){
  let position;
  if (system.hasComponent(entity, "minecraft:position")) {
      let comp = system.getComponent(entity,MinecraftComponent.Position);
      position = comp.data.x.toFixed(0) + " " + comp.data.y.toFixed(0) + " " + comp.data.z.toFixed(0);
  }
  else{
      position = "无法获得坐标";
  }
  return position;
}
