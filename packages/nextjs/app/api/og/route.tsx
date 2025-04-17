/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { blo } from "blo";
import { promises as fs } from "fs";
import { getAddress, isAddress } from "viem";
import { normalize } from "viem/ens";
import { ReviewAction } from "~~/services/database/config/types";
import {
  UserChallenges,
  getLatestSubmissionPerChallengeByUser,
} from "~~/services/database/repositories/userChallenges";
import { getEnsOrAddress, publicClient } from "~~/utils/ens-or-address";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address") || "0x0000000000000000000000000000000000000000";

    if (!isAddress(address)) {
      return new Response("Invalid Ethereum address format", { status: 400 });
    }

    const checksumAddress = getAddress(address);

    const { ensName, shortAddress } = await getEnsOrAddress(checksumAddress);

    let challenges: UserChallenges = [];
    try {
      const allChallenges = await getLatestSubmissionPerChallengeByUser(address);
      challenges = allChallenges.filter(challenge => challenge.reviewAction === ReviewAction.ACCEPTED);
    } catch (error) {
      console.error("Error fetching builder challenges", error);
    }

    // Try to resolve ENS avatar if we have an ENS name
    let avatarUrl = null;
    if (ensName) {
      try {
        avatarUrl = await publicClient.getEnsAvatar({ name: normalize(ensName) });
      } catch (error) {
        console.error("Error resolving ENS avatar:", error);
      }
    }

    // punk size with scale = 1
    const PUNK_SIZE = 112;
    // punk size pixels in the original file
    const ORIGINAL_PUNK_SIZE = 24;
    const PUNK_SIZE_RATIO = PUNK_SIZE / ORIGINAL_PUNK_SIZE;
    const part1 = address?.slice(2, 22);
    const part2 = address?.slice(-20);

    const backgroundPositionX = parseInt(part1, 16) % 100;
    const backgroundPositionY = parseInt(part2, 16) % 100;

    const computedScale = 1;

    const imageBuffer = await fs.readFile("public/punks.png");
    const imageData = `data:image/png;base64,${imageBuffer.toString("base64")}`;

    return new ImageResponse(
      (
        <div
          style={{
            background: "#c8f5ff",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 80,
            }}
          >
            {/* Logo */}
            <svg
              width={400}
              viewBox="0 0 800 229"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: "relative",
                color: "#088484",
                zIndex: 1,
              }}
            >
              <g fill="currentColor">
                <path d="M67.1829 57.1724C67.1829 56.478 66.607 55.8994 65.8007 55.8994H27.6758C26.8695 55.8994 26.2936 56.478 26.2936 57.1724C26.2936 74.8797 46.22 84.3699 69.0258 84.3699C97.821 84.3699 113.025 74.0696 113.025 57.5196C113.025 39.8124 97.821 29.2806 68.9106 29.2806C65.9159 29.2806 65.6855 27.1974 65.6855 26.3873C65.6855 24.8827 67.1829 23.6097 69.0258 23.6097C70.7535 23.6097 72.2508 24.6513 72.2508 26.2715C72.2508 27.3132 72.9419 27.8918 73.8634 27.8918H110.836C111.643 27.8918 112.219 27.3132 112.219 26.6188C112.219 9.25869 92.1772 0 69.6017 0C46.911 0 25.7177 11.5734 25.7177 27.8918C25.7177 45.7148 43.5708 54.0476 69.2561 54.1634C71.9053 54.1634 73.633 55.4364 73.633 57.5196C73.633 59.0242 72.2509 60.2973 70.5231 60.2973C68.4499 60.2973 67.1829 59.2557 67.1829 57.1724Z" />
                <path d="M120.468 0C119.661 0 119.316 0.578668 119.316 1.27307V83.3283C119.316 84.0227 119.777 84.3699 120.468 84.3699H158.247C158.938 84.3699 159.514 83.7912 159.514 83.0968V58.4455H172.184C187.848 58.4455 200.634 45.5991 200.634 28.702C200.634 12.9622 187.848 0 172.184 0H120.468ZM158.247 33.0998V25.9244H160.205C162.278 25.9244 163.891 27.5446 163.891 29.5121C163.891 31.5953 162.278 33.0998 160.205 33.0998H158.247Z" />
                <path d="M209.242 0C208.551 0 208.091 0.578668 208.091 1.15734V83.3283C208.091 83.9069 208.551 84.3699 209.242 84.3699H289.178C289.869 84.3699 290.33 84.0227 290.33 83.2125V60.1815C290.33 59.4871 289.869 59.1399 289.178 59.1399H246.791V54.9735H274.089C274.78 54.9735 275.126 54.6263 275.126 53.8162V30.6694C275.126 29.8593 274.78 29.5121 274.089 29.5121H246.791V25.3457H289.178C289.869 25.3457 290.33 24.9985 290.33 24.1883V1.15734C290.33 0.347204 289.869 0 289.178 0H209.242Z" />
                <path d="M299.003 0C298.312 0 297.851 0.578668 297.851 1.15734V83.3283C297.851 83.9069 298.312 84.3699 299.003 84.3699H378.938C379.629 84.3699 380.09 84.0227 380.09 83.2125V60.1815C380.09 59.4871 379.629 59.1399 378.938 59.1399H336.552V54.9735H363.849C364.541 54.9735 364.886 54.6263 364.886 53.8162V30.6694C364.886 29.8593 364.541 29.5121 363.849 29.5121H336.552V25.3457H378.938C379.629 25.3457 380.09 24.9985 380.09 24.1883V1.15734C380.09 0.347204 379.629 0 378.938 0H299.003Z" />
                <path d="M388.763 0C388.072 0 387.611 0.578668 387.611 1.15734V83.3283C387.611 83.9069 388.072 84.3699 388.763 84.3699H427.003C450.154 84.3699 468.929 65.3895 468.929 42.2428C468.929 18.9803 450.154 0 427.118 0H388.763ZM424.699 46.1777V37.9607H427.003C429.306 37.9607 431.149 39.8124 431.149 42.1271C431.149 44.4417 429.306 46.1777 427.003 46.1777H424.699Z" />
                <path d="M540.051 54.2791C550.187 49.8812 556.983 39.4652 556.983 28.239C556.983 11.4576 544.889 0 528.188 0H477.623C476.932 0 476.471 0.462936 476.471 1.15734V83.2125C476.471 83.9069 476.932 84.3699 477.623 84.3699H511.602C512.293 84.3699 512.753 83.9069 512.753 83.2125V74.301L519.549 83.9069C519.779 84.2541 520.125 84.3699 520.47 84.3699H558.595C559.056 84.3699 559.402 84.1384 559.632 83.7912C559.862 83.444 559.862 82.9811 559.632 82.6339L540.051 54.2791ZM513.099 31.8268V24.6513H515.057C517.13 24.6513 518.858 26.2715 518.858 28.239C518.858 30.2065 517.13 31.8268 515.057 31.8268H513.099Z" />
                <path d="M609.976 44.7889C608.363 44.7889 606.981 43.5159 606.981 41.7799V1.15734C606.981 0.462936 606.521 0 605.945 0H568.396C567.705 0 567.244 0.462936 567.244 1.15734V42.4743C567.244 65.7367 586.594 84.3699 609.976 84.3699C633.358 84.3699 652.708 65.7367 652.708 42.4743V1.15734C652.708 0.462936 652.247 0 651.556 0H614.007C613.431 0 612.971 0.462936 612.971 1.15734V41.7799C612.971 43.5159 611.588 44.7889 609.976 44.7889Z" />
                <path d="M701.575 41.8956C701.575 41.6641 701.806 41.6641 701.806 41.8956L707.104 83.3283C707.219 83.7912 707.565 84.2541 708.026 84.3699H745.805C746.381 84.3699 746.957 83.9069 746.957 83.3283V1.15734C746.957 0.462936 746.381 0 745.805 0H708.371C707.795 0 707.334 0.462936 707.334 1.15734V41.5484C707.334 41.7799 707.104 41.7799 707.104 41.5484L701.921 1.0416C701.806 0.347203 701.345 0 700.654 0H662.99C662.414 0 661.953 0.462936 661.953 1.15734V83.3283C661.953 83.9069 662.414 84.3699 662.99 84.3699H700.424C701 84.3699 701.575 83.9069 701.575 83.3283V41.8956Z" />
                <path d="M1.15181 101.512C0.460724 101.512 0 102.091 0 102.67V184.841C0 185.419 0.460724 185.882 1.15181 185.882H81.0874C81.7785 185.882 82.2392 185.535 82.2392 184.725V161.694C82.2392 161 81.7785 160.652 81.0874 160.652H38.7008V156.486H65.9987C66.6898 156.486 67.0353 156.139 67.0353 155.329V132.182C67.0353 131.372 66.6898 131.025 65.9987 131.025H38.7008V126.858H81.0874C81.7785 126.858 82.2392 126.511 82.2392 125.701V102.67C82.2392 101.86 81.7785 101.512 81.0874 101.512H1.15181Z" />
                <path d="M90.1939 101.512C89.618 101.512 89.1573 101.975 89.1573 102.554V143.177C89.1573 143.755 89.618 144.218 90.1939 144.218H111.157V184.841C111.157 185.419 111.618 185.882 112.193 185.882H149.627C150.203 185.882 150.779 185.419 150.779 184.841V144.218H171.742C172.318 144.218 172.779 143.755 172.779 143.177V102.554C172.779 101.975 172.318 101.512 171.742 101.512H90.1939Z" />
                <path d="M265.887 102.67C265.887 102.091 265.426 101.512 264.851 101.512H226.726C226.15 101.512 225.574 102.091 225.574 102.67V131.719H220.621V102.67C220.621 102.091 220.16 101.512 219.469 101.512H181.344C180.768 101.512 180.308 102.091 180.308 102.67V184.725C180.308 185.419 180.768 185.882 181.344 185.882H219.469C220.16 185.882 220.621 185.419 220.621 184.725V157.643H225.574V184.725C225.574 185.419 226.15 185.882 226.726 185.882H264.851C265.426 185.882 265.887 185.419 265.887 184.725V102.67Z" />
                <path d="M275.157 101.512C274.465 101.512 274.005 102.091 274.005 102.67V184.841C274.005 185.419 274.465 185.882 275.157 185.882H355.092C355.783 185.882 356.244 185.535 356.244 184.725V161.694C356.244 161 355.783 160.652 355.092 160.652H312.706V156.486H340.003C340.695 156.486 341.04 156.139 341.04 155.329V132.182C341.04 131.372 340.695 131.025 340.003 131.025H312.706V126.858H355.092C355.783 126.858 356.244 126.511 356.244 125.701V102.67C356.244 101.86 355.783 101.512 355.092 101.512H275.157Z" />
                <path d="M427.345 155.792C437.481 151.394 444.276 140.978 444.276 129.751C444.276 112.97 432.182 101.512 415.481 101.512H364.917C364.226 101.512 363.765 101.975 363.765 102.67V184.725C363.765 185.419 364.226 185.882 364.917 185.882H398.895C399.586 185.882 400.047 185.419 400.047 184.725V175.814L406.843 185.419C407.073 185.767 407.418 185.882 407.764 185.882H445.889C446.35 185.882 446.695 185.651 446.926 185.304C447.156 184.956 447.156 184.494 446.926 184.146L427.345 155.792ZM400.392 133.339V126.164H402.351C404.424 126.164 406.152 127.784 406.152 129.751C406.152 131.719 404.424 133.339 402.351 133.339H400.392Z" />
                <path d="M455.689 101.512C454.998 101.512 454.537 102.091 454.537 102.67V184.841C454.537 185.419 454.998 185.882 455.689 185.882H535.625C536.316 185.882 536.777 185.535 536.777 184.725V161.694C536.777 161 536.316 160.652 535.625 160.652H493.238V156.486H520.536C521.227 156.486 521.573 156.139 521.573 155.329V132.182C521.573 131.372 521.227 131.025 520.536 131.025H493.238V126.858H535.625C536.316 126.858 536.777 126.511 536.777 125.701V102.67C536.777 101.86 536.316 101.512 535.625 101.512H455.689Z" />
                <path d="M587.03 146.301C585.417 146.301 584.035 145.028 584.035 143.292V102.67C584.035 101.975 583.574 101.512 582.998 101.512H545.449C544.758 101.512 544.298 101.975 544.298 102.67V143.987C544.298 167.249 563.648 185.882 587.03 185.882C610.411 185.882 629.762 167.249 629.762 143.987V102.67C629.762 101.975 629.301 101.512 628.61 101.512H591.061C590.485 101.512 590.024 101.975 590.024 102.67V143.292C590.024 145.028 588.642 146.301 587.03 146.301Z" />
                <path d="M723.665 185.882C724.241 185.882 724.356 185.882 724.586 185.188L733.801 155.329C734.031 154.519 734.607 154.171 735.183 154.171C735.874 154.171 736.335 154.866 736.335 155.444V184.841C736.335 185.419 736.796 185.882 737.372 185.882H774.46C775.036 185.882 775.496 185.419 775.496 184.841V102.67C775.496 101.975 775.036 101.512 774.46 101.512H714.22C713.644 101.512 713.414 101.86 713.184 102.67L708.116 121.187C707.885 121.882 707.424 122.113 706.849 122.113C706.273 122.113 705.812 121.882 705.582 121.187L700.283 102.67C700.053 101.86 699.822 101.512 699.247 101.512H639.007C638.431 101.512 637.97 101.975 637.97 102.67V184.841C637.97 185.419 638.431 185.882 639.007 185.882H676.095C676.671 185.882 677.132 185.419 677.132 184.841V155.444C677.132 154.866 677.593 154.171 678.284 154.171C678.86 154.171 679.435 154.519 679.666 155.329L688.88 185.188C689.111 185.882 689.226 185.882 689.802 185.882H723.665Z" />
              </g>
              <path
                d="M766.864 171.043L763.432 168.696L761.144 169.282L761.716 218.583L764.576 220.343L768.58 217.409L772.012 212.714L775.444 210.366L778.876 215.648L780.592 220.343L781.164 223.278L784.024 226.212L788.6 227.386L790.887 224.452V220.93L788.6 214.474L785.74 210.953V208.018L796.607 206.845L797.751 203.323L794.891 199.802L791.459 196.28L788.6 193.346L785.74 190.411L782.88 187.477L778.876 183.368L774.3 178.673L770.296 174.565L766.864 171.043Z"
                fill="#C8F5FF"
              />
              <path d="M783.326 205.044V211.892H786.674V208.479H800V201.631H796.674V205.044H783.326Z" fill="#009E9E" />
              <path d="M796.674 198.195H793.326V201.63H796.674V198.195Z" fill="#009E9E" />
              <path d="M793.326 218.739H790V225.565H793.326V218.739Z" fill="#009E9E" />
              <path d="M793.326 194.783H790V198.195H793.326V194.783Z" fill="#009E9E" />
              <path d="M790 211.891H786.674V218.739H790V211.891Z" fill="#009E9E" />
              <path d="M790 191.37H786.674V194.782H790V191.37Z" fill="#009E9E" />
              <path d="M790 225.565H783.326V229H790V225.565Z" fill="#009E9E" />
              <path d="M786.674 187.935H783.326V191.37H786.674V187.935Z" fill="#009E9E" />
              <path d="M783.326 218.739H780V225.565H783.326V218.739Z" fill="#009E9E" />
              <path d="M783.326 184.522H780V187.934H783.326V184.522Z" fill="#009E9E" />
              <path d="M780 211.891H776.652V218.739H780V211.891Z" fill="#009E9E" />
              <path d="M780 181.086H776.652V184.521H780V181.086Z" fill="#009E9E" />
              <path d="M776.652 208.479H773.326V211.892H776.652V208.479Z" fill="#009E9E" />
              <path d="M776.652 177.673H773.326V181.086H776.652V177.673Z" fill="#009E9E" />
              <path d="M773.326 211.891H770V215.304H773.326V211.891Z" fill="#009E9E" />
              <path d="M773.326 174.261H770V177.674H773.326V174.261Z" fill="#009E9E" />
              <path d="M770 215.304H766.652V218.739H770V215.304Z" fill="#009E9E" />
              <path d="M770 170.826H766.652V174.261H770V170.826Z" fill="#009E9E" />
              <path
                d="M760 164V222.152H766.652V218.739H763.326V170.826H766.652V167.413H763.326V164H760Z"
                fill="#009E9E"
              />
            </svg>

            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl || ""}
                width={200}
                height={200}
                alt="Avatar"
                style={{
                  margin: 0,
                  marginTop: 20,
                  borderRadius: "50%",
                  borderWidth: 5,
                  borderColor: "white",
                  borderStyle: "solid",
                }}
              />
            ) : (
              <div
                style={{
                  margin: 0,
                  marginTop: 30,
                  display: "flex",
                  overflow: "hidden",
                  width: 117,
                  height: 117,
                  borderRadius: "50%",
                  borderWidth: 5,
                  borderColor: "white",
                  borderStyle: "solid",
                }}
              >
                <img
                  alt={address}
                  src={blo(address as `0x${string}`, PUNK_SIZE * computedScale)}
                  style={{
                    position: "absolute",
                    opacity: 0.5,
                    inset: 0,
                  }}
                />
                <img
                  width={`${2400 * PUNK_SIZE_RATIO * computedScale}`}
                  height={`${2400 * PUNK_SIZE_RATIO * computedScale}`}
                  src={imageData}
                  alt="Punks Image"
                  style={{
                    position: "absolute",
                    top: `${-PUNK_SIZE * backgroundPositionY * computedScale}px`,
                    left: `${-PUNK_SIZE * backgroundPositionX * computedScale}px`,
                    imageRendering: "pixelated",
                  }}
                />
              </div>
            )}

            {/* Address or ENS Name Text */}
            <div
              style={{
                marginTop: 10,
                fontSize: 52,
                fontWeight: "bold",
                textAlign: "center",
                color: "#088484",
              }}
            >
              {ensName || shortAddress}
            </div>

            <div
              style={{
                marginTop: 5,
                display: "flex",
                fontSize: 28,
                textAlign: "center",
                color: "#4a5565",
              }}
            >
              Challenges Completed: {challenges.length}
            </div>
          </div>

          {/* Clouds */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 1335 128"
            style={{
              position: "absolute",
              top: 30,
              left: -40,
              zIndex: -1,
            }}
          >
            <path
              fill="#A8E7F4"
              d="M422.5 117.25v-9.8h-9.8v-8.4h-14v4.5h-4.2v-9.4h-4.2v-6.3h-14v8.4h-4.2v16h-19.5v4.9h-8.4v-4.9h-14.7v5.6h2.8v4.2h94.9v-4.9l-4.7.1Z"
            />
            <path
              fill="#2FBABB"
              d="M403 121.85v-4.6h4.9v-9.7h-9.8v4.9h-4.9V121.85h-24.4v-4.6h4.9v-4.8h4.9v-4.9h-4.9v-9.5h7v-10.1h-4.9v5.1h-4.9v5h-5.6v5.1h-3.5v4.4h-7.7v4.9h9.8v4.1H359v5.3h-19.5v-5.3h-4.9v-4.1h-4.9v4.1h-4.9v5.3h-4.9v5.2h107.5v-5.2H403Z"
            />
            <path fill="#2FBABB" d="M349.3 112.45h4.9v4.9h-4.9v-4.9Z" />
            <path
              fill="#A8E7F4"
              d="M1241.2 19.85v-5.3h-15.7v-4.2h-4.2v-4.1h-5.2V.95h-10.5v5.3h-6.3v10.4h3.2v8.4h42.9v-5.2h-4.2Z"
            />
            <path fill="#2FBABB" d="M1201.4 25.05h44v-5.2h-33.5v-5.3h-9.4v-4.2h4.1V.95h-5.2v5.3h-4.2V19.85h4.2v5.2Z" />
            <path
              fill="#A8E7F4"
              d="M198.9 21.35h42.9v5.2h-42.9v-5.2ZM221.9 16.15v-4.2h-4.2v-4.2h-5.2v-5.2H202v5.2h-6.3v10.5h3.2v3.1h38.7v-5.2h-15.7Z"
            />
            <path fill="#2FBABB" d="M208.3 20.85v-4.7h-9.4v-4.2h4.2v-9.4h-5.3v5.2h-4.2v13.6h4.2v5.3h44v-5.8h-33.5Z" />
            <path fill="#A8E7F4" d="M187.2 101.55v-5.3h-10.4v11.5h14.6v-6.2h-4.2Z" />
            <path fill="#2FBABB" d="M176.8 101.55h-5.3v10.4h19.9v-5.2h-14.6v-5.2Z" />
            <path fill="#A8E7F4" d="M1318.8 27.45v5.2h-4.1v6.3h14.6v-11.5h-10.5Z" />
            <path fill="#2FBABB" d="M1329.3 32.65v5.3h-14.6v5.2h19.9v-10.5h-5.3Z" />
            <path
              fill="#A8E7F4"
              d="M121.9 69.25v-4.3H117v-4.2h-4.8v-4.9h-9.1v-14H94v-4.9h-4.9v-4.8h-7v4.8h-.7v4.9H71v18.9H56.3v-10.5H43.1v10.5h-9.8v-9.1h-4.9v-4.9h-4.9v-4.9h-9.8v9.8H6.8v9.1H4.7v4.9h.7v9H131v-5.4h-9.1Z"
            />
            <path
              fill="#2FBABB"
              d="M112.9 74.45v-5.2H108v5.2h-9.8v-5.2H94v-2.9h-4.9v-5.2H94v-5.3h-4.9v5.3h-4.9V74.45H51.4v-4.7h-4.2v-4.8h-4.1v-4.4h4.1v-5.2h4.2v-5.1h-9v5.1h-4.2V69.75h4.2v4.7H19.3v-4.7h-4.9v-4.8H9.5v-12.7h4.2v-5.5H5.4v5H.5v18h4.9v9.8h130.5v-5.1h-23Z"
            />
            <path
              fill="#2FBABB"
              d="M79.3 32.15v4.8H71v4.9h-4.9v9.8h-4.9v9.8h4.9v4.9H71v-14.3h4.9v-5.1h3.4v-4.5h4.9v-10.3h-4.9Z"
            />
            <path
              fill="#A8E7F4"
              d="M1153.6 111.25v-4.2h4.8v-4h4.7v-4.8h8.8v-13.5h8.8v-4.7h4.7v-4.8h6.8v4.8h.7v4.7h10.1v18.3h14.2v-10.2h12.9v10.2h9.4v-8.8h4.8v-4.8h4.7v-4.7h9.5v9.5h6.7v8.8h2.1v4.7h-.7v8.8h-121.8v-5.3h8.8Z"
            />
            <path
              fill="#2FBABB"
              d="M1162.4 116.25v-5h4.8v5h9.4v-5h4.1v-2.7h4.7v-5.2h-4.7v-5.1h4.7v5.1h4.8v12.9h31.8v-4.4h4v-4.8h4.1v-4.2h-4.1v-5h-4v-5h8.7v5h4.1v14h-4.1v4.4h22.4v-4.4h4.7v-4.8h4.7V94.75h-4v-5.3h8.1v4.9h4.7v17.5h-4.7v9.4h-126.5v-5h22.3Z"
            />
            <path
              fill="#2FBABB"
              d="M1194.9 75.25v4.8h8.1v4.7h4.7v9.5h4.8v9.4h-4.8v4.8h-4.7v-13.8h-4.7v-5h-3.4v-4.3h-4.7v-10.1h4.7Z"
            />
          </svg>

          {/* Running Girl Grass */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 1825 171"
            style={{
              position: "absolute",
              bottom: -30,
              left: -300,
              right: 0,
            }}
          >
            <g clip-path="url(#a)">
              <path fill="#009E9E" d="M819.8 84.3h-55v3.9H753V100h66.8V84.3Z" />
              <path
                fill="#29B8B8"
                fill-opacity=".962"
                d="M753 92.2h7.8v3.9h4v-7.9H753v4ZM819.8 84.3H806v-3.9h-11.8v3.9h-17.6v-3.9h-11.8v7.8h7.8v4h4v-4h3.9v4h11.8v-4h11.8V92h3.9v4.1h3.9V92h4v-3.8h3.9v-3.9Z"
              />
              <path fill="#009E9E" d="M1087.2 84.3h55.1v3.9h11.7V100h-66.8V84.3Z" />
              <path
                fill="#29B8B8"
                fill-opacity=".962"
                d="M1154 92.2h-7.8v3.9h-3.9v-7.9h11.7v4ZM1087.2 84.3h13.8v-3.9h11.8v3.9h17.7v-3.9h11.8v7.8h-7.9v4h-3.9v-4h-4v4h-11.8v-4h-11.8V92h-3.9v4.1h-3.9V92h-3.9v-3.8h-4v-3.9Z"
              />
              <path fill="#009E9E" d="M67.6 85.9v3.5H57V100h60V85.9H67.6Z" />
              <path
                fill="#29B8B8"
                fill-opacity=".962"
                d="M104.7 85.9v-3.5H94.1v3.5H78.2v-3.5H67.6v7H57V93h7v3.5h3.6v-7.1h7V93h3.6v-3.6h3.5V93h10.6v-3.6h10.6V93h3.5v3.5h3.6V93h3.5v-3.6h3.5v-3.5h-12.3Z"
              />
              <path fill="#009E9E" d="M351.8 93.2v-3.5h-10.4v-6.9h-48.1v6.9H283V100h75.6v-6.8h-6.8Z" />
              <path
                fill="#29B8B8"
                fill-opacity=".962"
                d="M351.8 93.2v-3.5h-10.4v6.9h17.2v-3.4h-6.8ZM333.7 79.4h-6V76h-10.3v3.4h-17.2v3.4h-6.9v3.5h6.9v3.4h3.4v-3.4h3.4v3.4h10.4v-3.4h10.3v3.4H338v-3.4h3.4v-3.5h-7.7v-3.4ZM283 89.7v3.5h6.8v3.4h3.5v-6.9H283Z"
              />
              <path fill="#009E9E" d="M1268.6 93.2v-3.5h10.3v-6.9h48.2v6.9h10.3V100h-75.7v-6.8h6.9Z" />
              <path
                fill="#29B8B8"
                fill-opacity=".962"
                d="M1268.6 93.2v-3.5h10.3v6.9h-17.2v-3.4h6.9ZM1286.7 79.4h6V76h10.3v3.4h17.2v3.4h6.9v3.5h-6.9v3.4h-3.4v-3.4h-3.5v3.4H1303v-3.4h-10.3v3.4h-10.3v-3.4h-3.5v-3.5h7.8v-3.4ZM1337.4 89.7v3.5h-6.9v3.4h-3.4v-6.9h10.3Z"
              />
              <path fill="#2FBABB" d="M934 100H-16v41h950v-41Z" />
              <path fill="#009E9E" d="M435.5 96.6v-6.9h-20.6v3.5H408v6.8h35.2v-3.4h-7.7Z" />
              <path
                fill="#29B8B8"
                fill-opacity=".962"
                d="M425.2 89.7v-3.4h-6.9v3.4h-3.4v3.5H432v3.4h3.5V89.7h-10.3ZM411.4 93.2H408v3.4h6.8v-3.4h-3.4Z"
              />
              <path fill="#009E9E" d="M956.4 96.6v-6.9H977v3.5h6.9v6.8h-35.3v-3.4h7.8Z" />
              <path
                fill="#29B8B8"
                fill-opacity=".962"
                d="M966.7 89.7v-3.4h6.9v3.4h3.4v3.5H959.8v3.4h-3.4V89.7h10.3ZM980.4 93.2h3.5v3.4H977v-3.4h3.4Z"
              />
              <path fill="#009E9E" d="M1464.6 96.6v-6.9H1444v3.5h-6.9v6.8h35.3v-3.4h-7.8Z" />
              <path
                fill="#29B8B8"
                fill-opacity=".962"
                d="M1454.3 89.7v-3.4h-6.9v3.4h-3.4v3.5H1461.2v3.4h3.4V89.7h-10.3Z"
              />
              <path fill="#29B8B8" fill-opacity=".962" d="M1440.6 93.2h-3.5v3.4h6.9v-3.4h-3.4Z" />
              <path fill="#2FBABB" d="M1883.5 100h-950v41h950v-41Z" />
              <path fill="#A8E7F4" d="M586.3 63.1h-15.9v4.8h15.9v-4.8ZM590.2 12.3h-19.8v23.8h3.9V48h8V36.1h7.9V12.3Z" />
              <path fill="#026262" d="M534.7 8.3h-4v4h4v-4Z" />
              <path fill="#29B8B8" fill-opacity=".962" d="M590.3 20.2h-4v4h4v-4Z" />
              <path fill="#009E9E" d="M586.3 28.2h-4v4h4v-4Z" />
              <path fill="#29B8B8" fill-opacity=".962" d="M578.3 20.2h-4v4h4v-4Z" />
              <path fill="#026262" d="M590 8.3V4.4H570.4v3.9h-4v4h-4v11.9h4v8h4V16.3H574.3v-4h19.9v-4H590Z" />
              <path
                fill="#29B8B8"
                fill-opacity=".962"
                d="M570.4 4.4h-4v4h4v-4ZM566.4 8.3h-4v4h4v-4ZM586.3 48v-7.9h-4V48h-8v-7.9h-3.9v23.8h15.9V48Z"
              />
              <path fill="#026262" d="M586.3 71.9v-4h-19.9v15.9h7.9v-4h8v4h7.9V71.9h-3.9Z" />
              <path
                fill="#A8E7F4"
                d="M590.3 40.1h-4V48h4v-7.9ZM598.1 48h-7.9v4h7.9v-4ZM566.4 40.1v4h-4V48h8v-7.9h-4ZM562.5 48h-4v7.9h4V48ZM602.2 44.1h-4v4h4v-4ZM566.4 56h-4v4h4v-4ZM566.4 83.8h-4v4h8v-4h-4Z"
              />
              <path fill="#026262" d="M562.5 83.8h-4v7.9h4v-7.9Z" />
              <path fill="#A8E7F4" d="M590.2 83.8h-7.9v4h4v7.9h3.9V83.8Z" />
              <path
                fill="#026262"
                d="M594.2 95.7h-7.9v4h7.9v-4ZM566.4 4.4v-4h-11.9v4h-8v3.9h-3.9v4h-8v4h15.9v-4h8v-4h7.9V4.4Z"
              />
              <path
                fill="#088484"
                d="M300.4 161.1h-4.3v6.1h4.3v-6.1ZM361.5 158.1h-4.3v6.1h4.3v-6.1ZM1026.3 161.4h-4.3v7.8h4.3v-7.8ZM961.9 158.1h-4.3v6.1h4.3v-6.1ZM1045.5 158.1h-4.3v6.1h4.3v-6.1ZM1366.7 157.6h-4.3v6.1h4.3v-6.1ZM1420.2 153.5h-4.9v9.8h4.9v-9.8Z"
              />
              <path
                fill="#088484"
                d="M1883.5 138.9V121H-16v22.8H6.9v4.8h9.9v-4.8h14.8v4.8h14.8v4.9h9.9v-4.9h4.9v-4.8h4.9v4.8h5.4v4.9h6.7v-4.9h17.5v-4.8h4.9v4.8h4.9v4.9h9.9v-4.9h4.9v4.9h4.9v-4.9h4.9v-4.8h9.9v4.8h4.9v-4.8h4.9v4.8h9.9v-4.8h3.7v5.1h4.6v5.4h6.8v4.7h4.3v-4.7h10.2v-10.5h9.9v4.5h2.8v10.2h4.3v-10.2h2.8v-4.5H224v4.5h14.8v5.1h9.9v-5.1h4.9v-4.5h4.9v4.5h14.8v-4.5h4.9v9.4h4.9v-5h4.9v-4.4h4.9v4.4h4.9v5h2.5v7.8h4.3v-7.8h3.1v-5h4.9v5h4.9v-5h4.9v-4.4h9.9v4.4h20.3v9.8h4.3v-9.8h5v-4.4h16.6v4.4h9.9v-4.4H403v4.4h9.9v-4.4h3.5v4.4h14.8v5.3h9.9v-5.3h4.9v-4.4h4.9v4.4h14.8v-4.4h4.9v9.7h4.9v-5.1h4.9v-4.6h4.9v4.6h4.9v5.1h9.9v-5.1h4.9v5.1h4.9v-5.1h4.9v-4.6h9.9v4.6h4.9v-4.6h4.9v4.6h9.9v-4.6h4.9v4.9h4.9v-4.9h9.9v4.9h9.9v-4.9h9.9v4.9h9.9v-4.9h14.8v4.9h14.8v4.9h9.9v-4.9h4.9v-4.9h4.9v4.9h14.8v-4.9h4.9v9.8h4.9v-4.9h4.9v-4.9h4.9v4.9h4.9v4.9h9.9v-4.9h4.9v4.9h4.9v-4.9h4.9v-4.9h9.9v4.9h4.9v-4.9h4.9v4.9h9.9v-4.9h4.9v4.9h4.9v-4.9h9.9v4.9h9.9v-4.9h9.9v4.9h9.9v-4.9h14.8v4.9h14.8v4.9h9.9v-4.9h4.9v-4.9h4.9v4.9h16.3v5.1h6.8v5.4h4.3v-5.4h12.1v-.3h9.9v5h4.9v-5h4.9v-4.9h4.9v-4.9h9.9v4.9h4.9v-4.9h4.9v4.9h9.9v-4.9h3.9v4.9h13v-4.8h9.9v4.8h5.6v9.5h4.3v-14.3h14.8v4.8h14.8v4.9h9.9v-4.9h4.9v-4.8h4.9v4.8h5.2v4h.2v.8h4.8v7.9h4.3v-12.8h6.8v9.5h4.3v-9.5h4v-4.8h4.9v4.8h4.9v4.9h9.9v-4.9h4.9v4.9h4.9v-4.9h4.9v-4.8h9.9v4.8h4.9v-4.8h4.9v4.8h9.9v-4.8h4.9v4.8h4.9v-4.9h9.9v4.5h9.9v-4.5h9.9v4.5h9.9v-4.5h14.8v4.5h14.8v5.3h9.9v-5.3h4.9v-4.5h4.9v4.5h14.8v-4.5h4.9v9.7h4.9v-5.2h4.9v-4.5h4.9v4.5h4.9v5.2h9.9v-5.2h4.9v5.2h4.9v-5.2h4.9v-4.5h9.9v13.8h-4.3v6.1h4.3v-6.1h4.3v-9H1292.1v17h3.4v4.4h5.2V162h-4.3v-5.4h5v-8.2h9.3v-4.3h16.6v4.3h9.9v-4.3h14.5v4.3h5.6v9h4.3v-13.3h3.5v4.3h14.8v4.9h9.9v-4.9h4.9v-4.3h4.9v4.3h14.8v-4.3h4.9v9.2h4.9v-4.9h4.9v-4.3h4.9v4.3h4.9v4.9h9.9v-4.9h4.9v4.9h4.9v-4.9h4.9v-4.3h9.9v4.3h4.9v-4.3h4.9v4.3h6.4v5.4h12.1v5.4h4.3V154h6.8v-5.1h4.9v-.2h4.9v-4.9h9.9v4.9h9.9v-4.9h14.8v4.9h14.8v4.9h9.9v-4.9h4.9v-4.9h4.9v5.1h5v8.8h3.6v5.7h5v-7.8h-4.3v-6.9h5.5v-4.9h4.9v9.5h4.9v-4.6h4.9v-4.9h4.9v4.9h4.9v4.6h9.9v-4.6h4.9v4.6h4.9v-4.6h4.9v-4.9h9.9v4.9h4.9v-4.9h4.9v4.9h9.9v-4.9h4.9V142 148.6h4.9v-4.9h9.9v4.9h9.9v-4.9h9.9v4.9h9.9v-4.9h14.8v4.9h14.8v4.9h9.9v-4.9h4.9v-4.9h4.9v4.9h14.8v-4.9h4.9v9.8h4.9v-4.9h4.9v-4.9h4.9v4.9h4.9v4.9h9.9v-4.9h14.8v-4.9h34.5v-4.9h1.1v.1Z"
              />
              <path
                fill="#009E9E"
                d="M1851.3 119.5v-5h-29.6v5h-14.8v-5h-14.8v5h-5v-5h-4.9v5h-9.9v-5h-9.8v5h-19.8v-5h-9.8v5h-14.8v-5h-5v5h-9.9v-.1h-4.9v-4.9h-4.9v4.9h-9.9v-4.9h-9.8v4.9h-14.9v-4.9h-29.6v4.9h-14.8v-4.9h-14.8v4.9h-4.9v-4.9h-4.9v4.9h-9.9v-4.9h-9.9v4.9h-19.7v-4.9h-9.9v4.9h-14.8v-4.9h-4.9v4.9h-14.8v-4.9h-5v4.9h-9.8v-4.9h-9.9v4.9h-14.8v-4.9h-29.6v4.9H1422v-4.9h-14.8v4.9h-4.9v-4.9h-5v4.9h-9.8v-4.9h-9.9v4.9h-19.8v-4.9h-9.8v4.9h-14.8v-4.9h-5v4.9h-14.8v-4.9h-4.9v4.9h-9.9v-4.9h-9.8v4.9H1274v-4.9h-29.6v4.9h-14.8v-4.9h-14.8v4.9h-5v-4.9h-4.9v4.9h-9.9v-4.9h-9.8v4.9h-19.8v-4.9h-9.9v4.9h-14.8v-4.9h-4.9v4.9H1121v-4.9h-4.9v4.9h-9.9v-4.9h-9.9v4.9h-14.8v-4.9h-29.6v4.9h-14.8v-4.9h-14.8v4.9h-4.9v-4.9h-4.9v4.9h-9.9v-4.9h-9.9v4.9H973v-4.9h-9.9v4.9h-14.8v-4.9h-4.9v4.9h-9.9v.1h-7.1v-5h-9.8v5h-14.8v-5h-29.7v5h-14.8v-5h-14.8v5h-4.9v-5h-4.9v5h-9.9v-5h-9.9v5h-19.7v-5h-9.9v5h-14.8v-5h-4.9v5h-9.9v-.1h-4.9v-4.9h-4.9v4.9H734v-4.9h-9.9v4.9h-14.8v-4.9h-29.6v4.9h-14.8v-4.9h-14.8v4.9h-4.9v-4.9h-5v4.9h-9.8v-4.9h-9.9v4.9h-19.7v-4.9h-9.9v4.9h-14.8v-4.9h-4.9v4.9h-14.8v-4.9h-5v4.9h-9.9v-4.9h-9.8v4.9h-14.8v-4.9h-29.6v4.9h-14.8v-4.9h-14.8v4.9h-5v-4.9h-4.9v4.9h-9.9v-4.9h-9.8v4.9h-19.8v-4.9h-9.8v4.9h-14.9v-4.9h-4.9v4.9h-14.8v-4.9H359v4.9h-9.9v-4.9h-9.9v4.9h-14.8v-4.9h-29.6v4.9H280v-4.9h-14.8v4.9h-4.9v-4.9h-4.9v4.9h-9.9v-4.9h-9.9v4.9h-19.7v-4.9H206v4.9h-14.8v-4.9h-4.9v4.9h-14.8v-4.9h-5v4.9h-9.8v-4.9h-9.9v4.9H132v-4.9h-29.6v4.9H87.6v-4.9H72.8v4.9h-4.9v-4.9h-5v4.9h-9.8v-4.9h-9.9v4.9H23.4v-4.9h-9.8v4.9H-16v4.9H3.7v4.8h4.9v-4.8h9.9v4.8h4.9v4.9h5v-4.9h4.9v4.9h9.9v-4.9h4.9v-4.8h5v4.8H58v4.9h4.9v-9.7h5v4.8h14.8v-4.8h4.9v4.8h4.9v4.9h9.9v-4.9h14.8v-4.8H132v4.8h9.9v-4.8h9.8v4.8h9.9v-4.8h9.9v4.8h4.9v-4.8h4.9v4.8h9.9v-4.8h4.9v4.8h5v-4.8h9.8v4.8h5v4.9h4.9v-4.9h5v4.9h9.8v-4.9h5v-4.8h4.9v4.8h4.9v4.9h5v-9.7h4.9v4.8h14.8v-4.8h4.9v4.8h5v4.9h9.8v-4.9h14.8v-4.8h14.8v4.8h9.9v-4.8h9.9v4.8h9.8v-4.8h9.9v4.8h4.9v-4.8h5v4.4h9.8v-4.4h5v4.4h4.9v-4.4h9.9v4.4h4.9v5.3h5v-5.3h4.9v5.3h9.9v-5.3h4.9v-4.4h4.9v4.4h5v5.3h4.9v-9.7h4.9v4.4h14.8v-4.4h5v4.4h4.9v5.3h9.9v-5.3h14.8v-4.4h14.8v4.8h9.8v-4.8h9.9v4.8h9.9v-4.8h9.8v4.8h5v-4.8h4.9v4.8h9.9v-4.8h4.9v4.8h5v-4.8h9.8v4.5h5v5.2h4.9v-5.2h4.9v5.2h9.9v-5.2h4.9v-4.5h5v4.5h4.9v5.2h4.9v-9.7h5v4.5H660v-4.5h4.9v4.5h4.9v5.2h9.9v-5.2h14.8v-4.5h14.8v4.8h9.9v-4.8h9.9v4.8h9.8v-4.8h9.9v4.8h4.9v-4.7h5v4.7h9.8v-4.7h5v4.7h4.9v-4.7h9.9v4.7h4.9v4.9h4.9v-4.9h5v4.9h9.8v-4.9h5v-4.7h4.9v4.7h4.9v4.9h5V124.4h4.9v4.7h14.8v-4.7h4.9v4.7h5v4.9h9.8v-4.9h14.8v-4.7h14.9v4.7h9.8v-4.7h9.9v4.7h9.9v-4.7h3.1v-.1h3.9v4.8h9.9v-4.8h4.9v4.8h5v-4.8h9.8v4.8h5v4.9h4.9v-4.9h4.9v4.9h9.9v-4.9h4.9v-4.8h5v4.8h4.9v4.9h4.9v-9.7h5v4.8h14.8v-4.8h4.9v4.8h5v4.9h9.8v-4.9h14.8v-4.8h14.8v4.8h9.9v-4.8h9.9v4.8h9.8v-4.8h9.9v4.8h4.9v-4.8h5v4.8h9.8v-4.8h5v4.8h4.9v-4.8h9.9v4.8h4.9v4.9h4.9v-4.9h5v4.9h9.8v-4.9h5v-4.8h4.9v4.8h4.9v4.9h5v-9.7h4.9v4.8h14.8v-4.8h5v4.8h4.9v4.9h9.9v-4.9h14.8v-4.8h14.8v4.8h9.8v-4.8h9.9v4.8h9.9v-4.8h9.8v4.8h5v-4.8h4.9v4.5h9.9v-4.5h4.9v4.5h4.9v-4.5h9.9v4.5h4.9v5.2h5v-5.2h4.9v5.2h9.9v-5.2h4.9v-4.5h5v4.5h4.9v5.2h4.9v-9.7h5v4.5h14.8v-4.5h4.9v4.5h4.9v5.2h9.9v-5.2h14.8v-4.5h14.8v4.5h9.9v-4.5h9.8v4.5h9.9v-4.5h9.9v4.5h4.9v-4.5h5v4.5h9.8v-4.5h5v4.5h4.9v-4.5h9.8v4.5h5v5.2h4.9v-5.2h5v5.2h9.8v-5.2h5v-4.5h4.9v4.5h4.9v5.2h5v-9.7h4.9v4.5h14.8v-4.5h4.9v4.5h5v5.2h9.8v-5.2h14.8v-4.5h14.8v4.8h9.9v-4.8h9.9v4.8h9.8v-4.8h14.4-4.5v4.8h5v-4.7h4.9v4.7h9.9v-4.7h4.9v4.7h4.9v-4.7h9.9v4.7h4.9v4.9h5v-4.9h4.9v4.9h9.9v-4.9h4.9v-4.7h4.9v4.7h5v4.9h4.9V124.4h4.9v4.7h14.8v-4.7h5v4.7h4.9v4.9h9.9v-4.9h14.8v-4.7h47.5v-4.9h-32.7Z"
              />
            </g>
            <defs>
              <clipPath id="a">
                <path fill="#fff" d="M0 0h1825v171H0z" />
              </clipPath>
            </defs>
          </svg>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
