if (!self.define) {
  let e,
    s = {};
  const c = (c, n) => (
    (c = new URL(c + ".js", n).href),
    s[c] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = c), (e.onload = s), document.head.appendChild(e));
        } else ((e = c), importScripts(c), s());
      }).then(() => {
        let e = s[c];
        if (!e) throw new Error(`Module ${c} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, a) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[t]) return;
    let i = {};
    const r = (e) => c(e, t),
      o = { module: { uri: t }, exports: i, require: r };
    s[t] = Promise.all(n.map((e) => o[e] || r(e))).then((e) => (a(...e), i));
  };
}
define(["./workbox-f1770938"], function (e) {
  "use strict";
  (importScripts("/custom-sw.js"),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/static/CyXd-A4nURhcZeKPcx_bN/_buildManifest.js",
          revision: "681470f08a2fbcd00d4b658603632fb8",
        },
        {
          url: "/_next/static/CyXd-A4nURhcZeKPcx_bN/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/1181-6ebf9ea60af872a6.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/1365-3e1fa0571a21986d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/1950-2696ffbe23424467.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/1960-c6284fbce9299f35.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/198-1ee495cbe1c8dab0.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/2044-fc1cd4ca93c9d8e5.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/2315-390206716c427101.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/2578-2ea3324de6e56046.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/2615-15e8891a6cee60ef.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/32-b692ab7852b95b29.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/3476-3c62544c6c6328da.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/3572-1f3d7fe44484f5bc.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/3750-cb722391025ae06e.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/3784-43ff8072ef83fade.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/416e6ad5-ec1450936637993f.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/4215-ea8b98cac5eab2ef.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/4458-b42e8f1dc693329b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/4688-ff0026d1cbf4469d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/491-e5f033ac223505e6.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/4bd1b696-7320edd5c97070f7.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/5114-353f3f52d4181e20.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/5565-25bf7204a39d8cf4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/5761-65040773bdea1f2d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/5900-1c44cdbb35355767.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/6059-5b25862ed2100b6b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/608-08af27ea2bd8411e.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/624-cc36209b4e250b6b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/6624-16b774e94708fd8e.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/6803-9e96eb6687f98ca2.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/7040-ffb4743ccc8e1105.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/7091-b2994c81119dfcd1.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/7132-7ee3d59e8927ce5b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/7328-6c066da7df50886b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/7369-fb331b7689978bfa.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/7846-5d88006d778f6eb4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/7848-a67eb832f066cd03.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/8077-aee78ec030f17d3e.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/8085-f211df6f2d90e64b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/814-37c0c3e2ceabb770.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/8336-18cfef8455adc650.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/8617-d6408f112970dd39.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/8629-934b004c76cd4c08.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/8711-5ba43f13bfa53705.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/8767-830e294c5ba17a02.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/8902-bff9f64bd36b0eba.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/937-bb7ca0919ea26097.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/9764-d2da9ece9332f51f.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/9821-c26572166a5098e4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/9895-0810561145a999db.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/9941-4def559623d2991d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-bf3f51cd33c69524.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/auth/%5B...nextauth%5D/route-4abebb7b9ab4278c.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/auth/check-email/route-5625b7190a78a61c.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/auth/forgot-password/route-cbdb673360dc25f9.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/auth/register/route-230d5647b2c940ee.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/auth/reset-password/route-a9c5c850f151627d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/auth/validate-reset-token/route-1fc79f2c7f96d5e7.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/auth/verify-reset-code/route-2cbae89d0b75ea55.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/calories/route-d425376e35ca4a25.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/calories/save/route-a925c11160166df2.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/chats/%5BchatId%5D/messages/%5BmessageId%5D/route-40125379a0165186.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/chats/%5BchatId%5D/messages/route-fcf0a754c0ac7239.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/chats/%5BchatId%5D/route-730de3634bb50b91.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/chats/%5BchatId%5D/typing/route-d6495334c4baac67.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/chats/create/route-0ff2dcf4c47797f9.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/chats/route-44c4a70be33fc60d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/chats/unread-count/route-e3b65493c2db68d5.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/chats/upload/route-97074164b12786b3.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/config/exercise/%5Bid%5D/route-b297515f04c3f2ec.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/config/exercise/route-3d34993f3a1f03e7.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/config/food/route-4353aef4a9fdc2b6.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/custom-workout/route-b028af72abf0d2ab.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/exercises/route-8b20286de1e93fd4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/food-recommendations/%5Bid%5D/route-2f339ce849941137.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/food-recommendations/route-aa28fe2337a68fdd.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/foods/%5Bid%5D/route-02372518d1f58e9d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/foods/route-d868da190cab9e19.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/goals/%5Bid%5D/progress/route-fd85cdc61b94e5bb.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/goals/%5Bid%5D/route-34ff4fbfe05972fd.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/goals/route-c87c0f0adf73ab96.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/init/route-3e8dc7dd1ced4290.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/%5Bid%5D/route-857635db6633dfe8.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/cancel-plan/route-54ae32b4a13fdfd7.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/cancel-subscription/route-cca2232ae9a2e9cb.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/food-plans/assign/route-11f865c1a6adc2a2.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/profile/route-1db9d0b200f49968.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/register/route-40f2a9951030b87f.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/request-student/route-d02d6ddbc2d27047.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/route-72f680e5f07301fc.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/students/%5Bid%5D/accept/route-a8ac7516b15210cd.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/students/%5Bid%5D/food-plans/route-415468423216d604.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/students/%5Bid%5D/generate-plan/route-a52fe5eacc3237e4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/students/%5Bid%5D/profile/route-9053becad8dbc466.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/students/route-b31091c345c41651.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/students/stats/route-909822899c058268.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/students/workout-history/route-ab8ee1d7861c7d90.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/workouts/assign/route-ec2e2077028a2784.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/workouts/assigned/%5Bid%5D/route-109af0885f721e46.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/instructors/workouts/assigned/route-b326e96cc091a28c.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/meal-logs/%5Bid%5D/route-474408ac20741a91.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/meal-logs/route-a9327e2cf06e0833.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/notifications/%5Bid%5D/route-e14520ec05cf5699.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/notifications/route-60294e078d46cae6.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/nutrition-analytics/route-96ba3621f5513ae4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/payment/paypal/client-token/route-5932a9b3528464a4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/payment/paypal/create-plan/route-2e391f2df82244ae.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/payment/paypal/create-subscription/route-edc63e7d18b125d6.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/payment/paypal/webhook/route-cd9db1f8df3e4c8d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/payment/process/route-e78fb2aa274e8e1b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/personalized-workout/route-ef4a5e2e8f99a8d0.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/profile/route-c98ff336c287e04e.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/profile/update-weight/route-8852a79577b6c873.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/progress/%5Bid%5D/route-16fc80d107f500d4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/progress/route-5e6f0dc1ea68c124.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/push/send/route-42b1578e0e457e0b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/push/subscribe/route-836abeb16d9449f5.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/push/vapid/route-1e21b4d4cd5dd0b0.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/recipes/%5Bid%5D/route-98a797d89c35b663.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/recipes/route-2b7b6d35ddf326da.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/recommendations/route-03a759d235ade9d4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/robots/route-64e6ebbb71360f50.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/student-instructor-requests/%5Bid%5D/accept/route-9e5ddd3aed78726d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/student-instructor-requests/%5Bid%5D/reject/route-3cdf9ee853e18571.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/student-instructor-requests/route-cc06e91921c855c1.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/students/cancel-instructor/%5Bid%5D/route-4e8e91ee68fb0f87.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/students/my-instructors/route-22bcd1ca90d441da.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/students/workouts/%5Bid%5D/route-b962fc7d3cc2d59a.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/students/workouts/assigned/route-a17f7028f658af07.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/upload/route-0ca3ab3c5bb595a3.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/users/%5Bid%5D/public/route-a95e12d3398f4011.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/users/me/tags/route-d8c365b8716feeff.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/water-intake/history/route-9c44206c848f729b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/water-intake/route-0357bdb0d88225b3.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-session/%5Bid%5D/route-8e011bf5000bd02c.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-session/active/route-0aa608ba240a4bb0.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-session/complete/route-e9186f8a58a74a1d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-session/exercise/route-01165bb790b73b88.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-session/history/route-722e3445d2c54064.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-session/notes/route-a036ad6b6fc64d58.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-session/route-d65c43d0c7ef1081.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-session/set/route-fbc4e5f2e9efceea.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-sessions/%5Bid%5D/complete/route-b7e75714e3a95561.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-sessions/init/route-93b71135e66f137b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-sessions/route-aef5db44e0ea3ef2.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-streak/check-reset/route-22543021bbb03e25.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-streak/rest-day/route-fb9369659117f81f.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workout-streak/route-ce1444025a4731fc.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workouts/%5Bid%5D/exercises/%5BexerciseId%5D/route-b0659cb41d3ae4fc.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workouts/%5Bid%5D/exercises/route-1c851f74b18ec113.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workouts/%5Bid%5D/route-c8089c12eb9101b8.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/api/workouts/route-06ddd3743a33d4be.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/auth/error/page-85b85b6bf9955e6f.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/auth/forgot-password/layout-b518a7bb22a44d3d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/auth/forgot-password/page-bfdc14d623d9caad.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/auth/layout-6e8ff1e813069154.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/auth/reset-password/layout-1b52081492c96f37.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/auth/reset-password/page-3708c56f2521d7b9.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/auth/signin/layout-7f5411accd6465f2.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/auth/signin/page-eaad80c98665730d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/auth/signup/layout-7cdfc4ad8498af91.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/auth/signup/page-6ba32bf62726a146.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/chats/layout-02d05b4878b4d4b6.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/chats/page-9f03f530d6396f3a.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/health/goal/layout-e3cc809192d025c1.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/health/goal/page-7484b3f3b8428439.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/health/goals/history/layout-e8275027e4afc148.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/health/goals/history/page-fa6af4b911c6fc1c.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/health/history/layout-0fd9081c8e2f34af.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/health/history/page-f58a4cd86efef34a.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/health/layout-594404bcdc5bcbfb.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/health/page-5ef3e6ed80eab753.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/instructors/%5Bid%5D/layout-16be3b3a806972f4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/instructors/%5Bid%5D/page-3bd7e6f138a6f3f3.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/instructors/layout-7b505fd10955b3dd.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/instructors/page-e01adf5e4e19a984.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/instructors/search/layout-69d2c4ed3c0f786f.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/instructors/search/page-dc68b5fbe3c14902.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/layout-6260724532f2ad0d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/notifications/layout-6dfb6d62ca062471.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/notifications/page-de11b4f29662c7b1.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/nutrition/food-plans/layout-39401c99205bbf22.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/nutrition/food-plans/page-d771b2d3c3f47a47.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/nutrition/food-plans/resume/layout-3ea499b7fddcb533.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/nutrition/food-plans/resume/page-42b7864050f71008.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/nutrition/layout-7c24eff40ea59c0e.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/nutrition/page-613b4b2d6c8beaa7.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/nutrition/plan/%5Bid%5D/layout-6eddc638184ba400.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/nutrition/plan/%5Bid%5D/page-0d17bd825f1702e3.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/nutrition/register-food/layout-122ac5f633cd4248.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/nutrition/register-food/page-e205a49b815f2e37.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/page-60a0444f9ebc8ba7.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/profile/layout-43a6d5b81d860ee4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/profile/page-e6af16fe0f35985d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/profile/payment/layout-f7cded8cc06ecdf9.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/profile/payment/page-82c85757a4bdd91c.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/profile/qr/layout-7e508ce1ec82d613.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/profile/qr/page-ce7a4031393828a0.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/students/layout-059843931699d5d3.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/students/list/%5Bid%5D/layout-8584dfec856c7d7b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/students/list/%5Bid%5D/mealplan/layout-42d6812fcb70b02a.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/students/list/%5Bid%5D/mealplan/page-577bff67e376d466.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/students/list/%5Bid%5D/page-c4e34bc424f05d0e.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/students/list/layout-bb2a3e8b8fc6e26f.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/students/list/page-d8d7475d8469f9d6.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/students/page-625d99a2e5f6940d.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/students/workout/%5Bid%5D/layout-edda9f26fe572012.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/students/workout/%5Bid%5D/page-40467bc698ba7fe7.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/workout/%5Bid%5D/layout-9cef4fd486ef6472.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/workout/%5Bid%5D/page-80395ac8a26db069.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/workout/active/layout-5784a4b36640281a.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/workout/active/page-e4e988977a91d865.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/workout/history/layout-596ac8f8a6a9d105.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/workout/history/page-83491c2cd7ebf14e.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/workout/layout-7d793bb5aaadf4e5.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/dashboard/workout/page-6b3dc5e33e65669f.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/error/page-78bac30ea4da87dc.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/layout-03a8586d8d468df4.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/onboarding/layout-13d829361fb5653e.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/onboarding/page-94d48f2474dfe758.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/onboarding/recommendations/layout-70e33890055cc5a0.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/onboarding/recommendations/page-5070e9d57a408e4e.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/page-4682bd3bd96b6a76.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/pricing/layout-4810fe81e197bd08.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/pricing/page-fa4da63e33b6454a.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/profile/%5BuserId%5D/layout-cd27eb8465845024.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/app/profile/%5BuserId%5D/page-b4103c7f6c37ebda.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/fc2f6fa8-7d586a1dec98e882.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/framework-400494aa14c16ece.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/main-app-9bbd58be30131e6c.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/main-c9487d15e24f86a5.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/pages/_app-9554eba8fe708cc7.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/pages/_error-910386ce79d014bd.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-9e50afed3d79104b.js",
          revision: "CyXd-A4nURhcZeKPcx_bN",
        },
        {
          url: "/_next/static/css/3bb3e698963e5fb7.css",
          revision: "3bb3e698963e5fb7",
        },
        {
          url: "/_next/static/css/6ad9841b43ad2bc9.css",
          revision: "6ad9841b43ad2bc9",
        },
        {
          url: "/_next/static/css/7e7d96b1e6991756.css",
          revision: "7e7d96b1e6991756",
        },
        {
          url: "/_next/static/media/028c0d39d2e8f589-s.p.woff2",
          revision: "c47061a6ce9601b5dea8da0c9e847f79",
        },
        {
          url: "/_next/static/media/19cfc7226ec3afaa-s.woff2",
          revision: "9dda5cfc9a46f256d0e131bb535e46f8",
        },
        {
          url: "/_next/static/media/21350d82a1f187e9-s.woff2",
          revision: "4e2553027f1d60eff32898367dd4d541",
        },
        {
          url: "/_next/static/media/5b01f339abf2f1a5.p.woff2",
          revision: "c36289c8eb40b089247060459534962c",
        },
        {
          url: "/_next/static/media/8e9860b6e62d6359-s.woff2",
          revision: "01ba6c2a184b8cba08b0d57167664d75",
        },
        {
          url: "/_next/static/media/ba9851c3c22cd980-s.woff2",
          revision: "9e494903d6b0ffec1a1e14d34427d44d",
        },
        {
          url: "/_next/static/media/c5fe6dc8356a8c31-s.woff2",
          revision: "027a89e9ab733a145db70f09b8a18b42",
        },
        {
          url: "/_next/static/media/df0a9ae256c0569c-s.woff2",
          revision: "d54db44de5ccb18886ece2fda72bdfe0",
        },
        {
          url: "/_next/static/media/e4af272ccee01ff0-s.p.woff2",
          revision: "65850a373e258f1c897a2b3d75eb74de",
        },
        { url: "/custom-sw.js", revision: "f7aab97c08c5c71ded57704f73871c0a" },
        { url: "/file.svg", revision: "d09f95206c3fa0bb9bd9fefabfd0ea71" },
        { url: "/globe.svg", revision: "2aaafa6a49b6563925fe440891e32717" },
        {
          url: "/googled600ed8d8ca80c92.html",
          revision: "b89ce90371f57d53e6dff22b7580cf9c",
        },
        {
          url: "/icons/browserconfig.xml",
          revision: "a4481f947e4584f2760ba19063d6dbf8",
        },
        {
          url: "/icons/favicon-114x114.png",
          revision: "0ca0cf1eaa09dd0fbcf85c318b8d751f",
        },
        {
          url: "/icons/favicon-120x120.png",
          revision: "9adc7d4ae82ff91d2c8663f04fafaa52",
        },
        {
          url: "/icons/favicon-128x128.png",
          revision: "2793fb1b88c5ee8d09f2d9019492532f",
        },
        {
          url: "/icons/favicon-144x144.png",
          revision: "3bf563827d2800db44c404ffc357af1c",
        },
        {
          url: "/icons/favicon-150x150.png",
          revision: "c0b3eb791a69fe6f8874a118681eb03b",
        },
        {
          url: "/icons/favicon-152x152.png",
          revision: "5e7dfbdc20821aa28cca0246ffc77f35",
        },
        {
          url: "/icons/favicon-16x16.png",
          revision: "f6b4838cd7d32b06a863e93c7649837d",
        },
        {
          url: "/icons/favicon-180x180.png",
          revision: "671ef53d71475509bca675bceed16f9c",
        },
        {
          url: "/icons/favicon-192x192.png",
          revision: "a91c05507196d48c6fa66d3266757da6",
        },
        {
          url: "/icons/favicon-310x310.png",
          revision: "9c4681ae58efeb1c1668684d43a3cfa4",
        },
        {
          url: "/icons/favicon-32x32.png",
          revision: "c3f3b28dd88e59c2e550ba50376d7129",
        },
        {
          url: "/icons/favicon-384x384.png",
          revision: "2599a028c57e1fe14204d6c8cbb4f454",
        },
        {
          url: "/icons/favicon-512x512.png",
          revision: "b65511dcf0999169fb97612c96546935",
        },
        {
          url: "/icons/favicon-57x57.png",
          revision: "7f4f83cc5af3a63a93a4b64722721466",
        },
        {
          url: "/icons/favicon-60x60.png",
          revision: "9e61f70e789da933465c1420355e7ee1",
        },
        {
          url: "/icons/favicon-70x70.png",
          revision: "81b8a290f6946ec593efe67647b3bc75",
        },
        {
          url: "/icons/favicon-72x72.png",
          revision: "018a43c58d94647588a72d094950fbcb",
        },
        {
          url: "/icons/favicon-76x76.png",
          revision: "cc92cef39625819f61f8c0d874185b38",
        },
        {
          url: "/icons/favicon-96x96.png",
          revision: "c3783b6b193e6297ea33cddb14555d07",
        },
        {
          url: "/icons/favicon.ico",
          revision: "263df441ba651e4d8f999b228f940556",
        },
        {
          url: "/icons/manifest.json",
          revision: "e0435eb222df5dd030862ec61369f51c",
        },
        {
          url: "/images/phone_dark.png",
          revision: "6a80601ae1d5c3507939e97c23068c3d",
        },
        {
          url: "/images/phone_light.png",
          revision: "1499f487ef1752c77f43bfa6a7b94e3c",
        },
        {
          url: "/images/pic_dark.png",
          revision: "ca07362a48d4dba9af34e5b22a7b8afc",
        },
        {
          url: "/images/pic_light.png",
          revision: "8048c4b73bd362cef82e2d4019bbcef1",
        },
        { url: "/manifest.json", revision: "b6f8c2037f2f4decd7aa93be177a6950" },
        { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
        { url: "/og-image.webp", revision: "5690374037ad0f4de846cbb13a8fac35" },
        {
          url: "/og-onboarding.webp",
          revision: "edc8a3cb3cf2d240e5f6c282101ef464",
        },
        { url: "/robots.txt", revision: "6643f7438c484241ef514a6d1b7578df" },
        { url: "/sitemap-0.xml", revision: "1368ce4e6e5ba804a5c139990c937a8f" },
        { url: "/sitemap.xml", revision: "e5bc26d9891acb11dbae424dfc563ea6" },
        {
          url: "/svg/streak.svg",
          revision: "b08284dbbdf0d10b60a46a69f499cc36",
        },
        { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
        { url: "/window.svg", revision: "a2760511c65806022ad20adf74370ff3" },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: function (e) {
              return _ref.apply(this, arguments);
            },
          },
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 2592e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/static.+\.js$/i,
      new e.CacheFirst({
        cacheName: "next-static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp4|webm)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 48, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      function (e) {
        var s = e.sameOrigin,
          c = e.url.pathname;
        return !(
          !s ||
          c.startsWith("/api/auth/callback") ||
          !c.startsWith("/api/")
        );
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      function (e) {
        var s = e.request,
          c = e.url.pathname,
          n = e.sameOrigin;
        return (
          "1" === s.headers.get("RSC") &&
          "1" === s.headers.get("Next-Router-Prefetch") &&
          n &&
          !c.startsWith("/api/")
        );
      },
      new e.NetworkFirst({
        cacheName: "pages-rsc-prefetch",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      function (e) {
        var s = e.request,
          c = e.url.pathname,
          n = e.sameOrigin;
        return "1" === s.headers.get("RSC") && n && !c.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "pages-rsc",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      function (e) {
        var s = e.url.pathname;
        return e.sameOrigin && !s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "pages",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      function (e) {
        return !e.sameOrigin;
      },
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET",
    ));
});
