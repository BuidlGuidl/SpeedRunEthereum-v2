/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { blo } from "blo";
import { promises as fs } from "fs";
import { Address, createPublicClient, getAddress, http, isAddress } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import {
  UserChallenges,
  getLatestSubmissionPerChallengeByUser,
} from "~~/services/database/repositories/userChallenges";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

const alchemyHttpUrl = getAlchemyHttpUrl(mainnet.id);
const rpcUrl = alchemyHttpUrl;
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address") || "0x0000000000000000000000000000000000000000";
    const theme = searchParams.get("theme") || "default";

    if (!isAddress(address)) {
      return new Response("Invalid Ethereum address format", { status: 400 });
    }

    const checksumAddress = getAddress(address);

    let ensName = null;
    try {
      ensName = await publicClient.getEnsName({ address: checksumAddress as Address });
    } catch (error) {
      console.error("Error resolving ENS name:", error);
    }

    let challenges: UserChallenges = [];
    try {
      const allChallenges = await getLatestSubmissionPerChallengeByUser(address);
      challenges = allChallenges.filter(challenge => {
        return challenge.reviewAction === "ACCEPTED";
      });
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

    // Theme colors
    const themes = {
      default: {
        primary: "#627EEA", // Ethereum blue
        secondary: "#3C3C3D", // Ethereum dark
        gradient: "linear-gradient(135deg, #627EEA 0%, #8A92B2 100%)",
        text: "#1F2937",
        subtext: "#6B7280",
      },
      purple: {
        primary: "#7B3FE4",
        secondary: "#452981",
        gradient: "linear-gradient(135deg, #7B3FE4 0%, #A78BFA 100%)",
        text: "#1F2937",
        subtext: "#6B7280",
      },
      dark: {
        primary: "#3C3C3D",
        secondary: "#1F2937",
        gradient: "linear-gradient(135deg, #3C3C3D 0%, #111827 100%)",
        text: "#F9FAFB",
        subtext: "#D1D5DB",
      },
    };

    const colors = themes[theme as keyof typeof themes] || themes.default;

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

    const imageBuffer = await fs.readFile(`${process.cwd()}/public/punks.png`);
    const imageData = `data:image/png;base64,${imageBuffer.toString("base64")}`;

    return new ImageResponse(
      (
        <div
          style={{
            background: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {/* Background with gradient */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colors.gradient,
              opacity: theme === "dark" ? 1 : 0.1,
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Logo */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 296 65" width={400}>
              <path fill="#A8E7F4" d="M287.832 8.557h-12.6v15.06h2.559v7.58h5.02v-7.58h5.021V8.558Z" />
              <path fill="#088484" d="M252.591 5.997h-2.56v2.56h2.56v-2.56Z" />
              <path
                fill="#088484"
                d="M270.211.977h-5.02v2.56h-5.119v2.46h-2.461v2.56h-5.02v2.46h10.041v-2.46h5.02v-2.56h5.02V.977h-2.461Z"
              />
              <path fill="#29B8B8" d="M287.832 13.577h-2.56v2.56h2.56v-2.56Z" />
              <path fill="#009E9E" d="M285.371 18.598h-2.56v2.559h2.56v-2.56Z" />
              <path fill="#29B8B8" d="M280.35 13.577h-2.559v2.56h2.559v-2.56Z" />
              <path
                fill="#088484"
                d="M287.831 5.997v-2.46h-12.6v2.46h-2.559v2.56h-2.461V15.94h2.461V20.862h2.559v-9.844h2.56V8.557h12.6v-2.56h-2.56Z"
              />
              <path fill="#29B8B8" d="M275.231 3.537h-2.559v2.559h2.559v-2.56Z" />
              <path
                fill="#29B8B8"
                d="M272.771 5.997h-2.56v2.56h2.56v-2.56ZM285.272 31.198v-5.02h-2.461v5.02h-5.02v-5.02h-2.559V41.336h10.04v-10.14Z"
              />
              <path fill="#A8E7F4" d="M285.272 41.337h-10.04v2.559h10.04v-2.56Z" />
              <path fill="#017171" d="M272.672 43.797h12.6v2.56h2.559v7.58h-5.02v-2.56h-5.02v2.56h-5.119v-10.14Z" />
              <path
                fill="#A8E7F4"
                d="M287.832 26.177h-2.56v5.02h2.56v-5.02ZM292.852 31.198h-5.021v2.559h5.021v-2.56ZM275.231 31.198v-5.02h-2.559v2.559h-2.559v2.559h5.118v-.098Z"
              />
              <path
                fill="#A8E7F4"
                d="M270.211 31.198h-2.559v5.02h2.559v-5.02ZM295.411 28.736h-2.559v2.56h2.559v-2.56ZM272.771 36.218h-2.56v2.56h2.56v-2.56ZM272.672 53.937h-2.559v2.559h5.118v-2.56h-2.559Z"
              />
              <path fill="#088484" d="M270.211 53.937h-2.559v5.02h2.559v-5.02Z" />
              <path fill="#A8E7F4" d="M282.811 53.937v2.46h2.461v5.021h2.56v-7.481h-5.021Z" />
              <path
                fill="#088484"
                d="M290.293 61.418h-5.021v2.56h5.021v-2.56ZM4.294 32.848c2.47 1.432 5.913 2.25 9.68 2.25 9.033 0 14.218-3.11 14.218-8.55 0-5.808-5.064-8.999-14.258-8.999-.77 0-1.256-.409-1.256-1.145 0-.614.567-1.105 1.296-1.105.73 0 1.256.45 1.256 1.064 0 .286.202.327.324.327h12.111c.162 0 .243-.082.243-.204 0-2.578-1.418-4.745-4.091-6.3-2.47-1.432-5.914-2.209-9.64-2.209C6.359 7.977 0 11.945 0 16.854c0 5.277 5.144 8.304 14.055 8.345 1.013 0 1.62.49 1.62 1.308 0 .614-.567 1.105-1.215 1.105-.81 0-1.296-.45-1.296-1.227 0-.123-.121-.205-.243-.205H.446c-.162 0-.243.082-.243.205 0 2.659 1.417 4.868 4.09 6.463ZM48.63 26.63c5.103 0 9.113-4.172 9.113-9.49 0-5.072-4.091-9.163-9.114-9.163H31.7c-.041 0-.163 0-.163.205v26.752c0 .041 0 .123.162.123h12.354c.122 0 .203-.082.203-.205V26.63h4.374Zm-4.537-7.526h-.243v-3.396h1.053c.972 0 1.742.778 1.742 1.718 0 .982-.77 1.718-1.742 1.718h-.81v-.04ZM87.416 35.057c.122 0 .162-.041.162-.164v-7.486c0-.04 0-.122-.162-.122H73.523a.204.204 0 0 1-.203-.205v-1.35c0-.112.091-.204.203-.204h8.952c.08 0 .121 0 .121-.164v-7.608c0-.164-.04-.164-.121-.164h-8.952a.204.204 0 0 1-.203-.204v-1.35c0-.112.091-.205.203-.205h13.893c.122 0 .162-.04.162-.163V8.14c0-.123-.04-.164-.162-.164H61.25c-.122 0-.162.123-.162.164v26.793c0 .082.08.123.162.123h26.166ZM117.251 7.977H91.085c-.122 0-.162.123-.162.164v26.793c0 .082.08.123.162.123h26.166c.122 0 .162-.041.162-.164v-7.486c0-.04 0-.122-.162-.122h-13.893a.205.205 0 0 1-.203-.205v-1.35c0-.112.091-.204.203-.204h8.952c.081 0 .121 0 .121-.164v-7.608c0-.164-.04-.164-.121-.164h-8.952a.204.204 0 0 1-.203-.204v-1.35c0-.112.091-.205.203-.205h13.893c.122 0 .162-.04.162-.163V8.44c0-.198.036-.463-.162-.463ZM133.491 7.977h-12.557c-.121 0-.162.123-.162.164v26.793c0 .082.081.123.162.123h12.517c7.452 0 13.528-6.054 13.528-13.54 0-7.445-6.035-13.54-13.488-13.54Zm.162 15.053h-1.175V19.308h1.175c1.053 0 1.904.86 1.904 1.882 0 1.022-.81 1.84-1.904 1.84ZM170.779 25.567l-.162-.205.243-.082c3.24-1.39 5.428-4.745 5.428-8.304 0-5.317-3.808-8.999-9.235-8.999h-16.567c-.081 0-.162.041-.162.164v26.752c0 .123.081.164.162.164h11.139c.081 0 .162-.041.162-.164v-4.909l2.592 5.032c.041.04.041.082.122.082h12.475c.041 0 .122 0 .162-.082a.124.124 0 0 0 0-.164l-6.359-9.285Zm-8.101-6.913h-1.013v-3.355h1.013c.972 0 1.782.737 1.782 1.677 0 .941-.769 1.678-1.782 1.678ZM194.245 35.057c7.615 0 13.813-6.054 13.813-13.458V8.14c0-.123-.081-.164-.162-.164h-12.314c-.081 0-.121.082-.121.164v13.253c0 .655-.527 1.187-1.175 1.187a1.182 1.182 0 0 1-1.175-1.187V8.141c0-.123-.04-.164-.121-.164h-12.314c-.081 0-.162.041-.162.164v13.458c-.081 7.445 6.116 13.458 13.731 13.458ZM224.202 21.149c.122 0 .243.123.243.245l1.742 13.5c.04.081.081.163.121.163h12.354c.081 0 .162-.082.162-.123V8.141c0-.123-.121-.164-.162-.164h-12.273c-.081 0-.121.082-.121.164v13.171a.235.235 0 0 1-.243.246c-.122 0-.243-.123-.243-.245L224.081 8.1c0-.082-.041-.164-.203-.164h-12.354c-.081 0-.122.082-.122.164v26.793c0 .082.041.123.122.123h12.273c.081 0 .162-.082.162-.123V21.394c.04-.122.122-.245.243-.245ZM.73 64.023h25.315c.121 0 .162-.041.162-.164v-7.322c0-.04 0-.123-.162-.123h-13.65v-1.718h8.83c.08 0 .121 0 .121-.163V47.17c0-.164-.04-.164-.121-.164h-8.83v-1.759h13.609c.122 0 .162-.04.162-.163V37.76c0-.122-.04-.163-.162-.163H.73c-.121 0-.162.081-.162.163v26.14c-.04.08.04.122.162.122ZM54.155 50.77c.081 0 .122-.042.122-.123V37.72c0-.081-.04-.122-.122-.122H28.354c-.081 0-.122.04-.122.122v12.927c0 .081.04.122.122.122H35.199V63.9c0 .082.04.123.121.123h11.828c.08 0 .162-.082.162-.123V50.77H54.155ZM71.613 63.86c0 .122.081.163.162.163h12.07c.082 0 .122-.082.122-.164V37.761c0-.082-.081-.163-.121-.163H71.775c-.081 0-.162.081-.162.163v9.45h-1.985v-9.45c0-.082-.04-.163-.162-.163h-12.07c-.081 0-.122.081-.122.163V63.86c0 .082.04.164.122.164h12.07c.122 0 .162-.041.162-.164v-8.794h1.985v8.794ZM88.017 64.023h25.316c.122 0 .162-.041.162-.164v-7.322c0-.04 0-.123-.162-.123h-13.61v-1.718h8.831c.081 0 .121 0 .121-.163V47.17c0-.164-.04-.164-.121-.164h-8.831v-1.759h13.61c.122 0 .162-.04.162-.163V37.76c0-.122-.04-.163-.162-.163H88.017c-.121 0-.161.081-.161.163v26.14c0 .08.08.122.162.122ZM136.705 54.778l-.122-.204.243-.082c3.119-1.35 5.225-4.623 5.225-8.1 0-5.154-3.645-8.794-8.911-8.794h-15.999c-.122 0-.162.04-.162.163V63.86c0 .123.04.164.162.164h10.734c.121 0 .162-.041.162-.164v-4.254l2.511 4.377c.04.04.04.04.121.04h12.071c.04 0 .121 0 .162-.081.04-.04.04-.082 0-.123l-6.197-9.04Zm-7.818-6.708h-1.012v-3.355h1.012c.972 0 1.782.777 1.782 1.677-.04.941-.81 1.678-1.782 1.678ZM145.575 64.023h25.316c.122 0 .162-.041.162-.164v-7.322c0-.04 0-.123-.162-.123h-13.61v-1.718h8.79c.081 0 .121 0 .121-.163V47.17c0-.164-.04-.164-.121-.164h-8.83v-1.759h13.609c.122 0 .163-.04.163-.163V37.76c0-.122-.041-.163-.163-.163h-25.315c-.122 0-.162.081-.162.163v26.14c.04.08.081.122.202.122ZM200.419 37.761c0-.122-.04-.163-.162-.163h-11.868c-.081 0-.121.081-.121.163v12.927c0 .654-.486 1.145-1.134 1.145-.649 0-1.135-.49-1.135-1.145V37.76c0-.082-.04-.163-.121-.163H174.01c-.122 0-.162.04-.162.163v13.131c0 7.24 5.995 13.13 13.326 13.13s13.326-5.89 13.326-13.13v-13.13h-.081ZM235.173 64.023h11.746c.081 0 .122-.041.122-.123V37.761c0-.082-.041-.163-.122-.163h-19.078c-.04 0-.081 0-.121.204l-1.621 5.89c-.081.287-.283.45-.607.45-.284 0-.486-.163-.608-.45l-1.66-5.89c-.082-.204-.081-.204-.122-.204h-19.078c-.081 0-.121.081-.121.163v26.14c0 .08.04.122.121.122h11.747c.081 0 .121-.041.121-.123v-9.367c0-.287.243-.614.567-.614.284 0 .527.205.648.532l2.917 9.49c0 .04.04.082.04.082H230.96s0-.041.04-.082l2.917-9.49c.081-.327.324-.532.648-.532s.567.327.567.614V63.9c-.122.082-.041.123.041.123Z"
              />
            </svg>

            {/* Avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {avatarUrl ? (
              <img
                src={avatarUrl || ""}
                width={200}
                height={200}
                alt="Avatar"
                style={{
                  margin: 0,
                  marginTop: 40,
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
                  marginTop: 40,
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
                color: colors.text,
                textAlign: "center",
              }}
            >
              {ensName || `${checksumAddress.slice(0, 6)}...${checksumAddress.slice(-6)}`}
            </div>

            <div
              style={{
                marginTop: 5,
                marginBottom: 16,
                display: "flex",
                fontSize: 28,
                color: colors.text,
                textAlign: "center",
              }}
            >
              Challenges Completed: {challenges.length}
            </div>
          </div>
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
