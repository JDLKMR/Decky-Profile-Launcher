import { definePlugin } from "@decky/api";
import { staticClasses } from "@decky/ui";
import { FaSlidersH } from "react-icons/fa";

import QamPanel from "./QamPanel";
import { registerLaunchInterceptor } from "./interceptor";
import { refresh } from "./store";

export default definePlugin(() => {
  // Prime the cache before hooking, so the first launch after boot can be
  // decided synchronously.
  void refresh();
  const unregister = registerLaunchInterceptor();

  return {
    name: "Launch Profiles",
    titleView: <div className={staticClasses.Title}>Launch Profiles</div>,
    content: <QamPanel />,
    icon: <FaSlidersH />,
    onDismount() {
      unregister();
    },
  };
});
