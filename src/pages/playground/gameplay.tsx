import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Meta } from '../../layout/Meta';
import ConfigService from '../../services/ConfigService';
import Base from '../../templates/Base';
import { GetServerSidePropsContext } from 'next';
import MatchTextContainer from '../../components/Game/MatchTextContainer';

const Index = () => {
  return (
    <>
      <Base meta={<Meta title={'Playground'} />} isLoaded={true}>
        <div className={'flex h-screen'}>
          <div className={'m-auto max-w-screen-lg'}>
            <MatchTextContainer
              quote={
                "Now, if you're part of Control Group Kepler-Seven, we implanted a tiny microchip about the size of a postcard into your skull. Most likely you've forgotten it's even there, but if it starts vibrating and beeping during this next test, let us know, because that means it's about to hit five hundred degrees, so we're gonna need to go ahead and get that out of you pretty fast."
              }
              disabled={false}
              removeLimit={true}
              sendKeystroke={() => false}
              isSuddenDeath={false}
            />
          </div>
        </div>
      </Base>
    </>
  );
};

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ConfigService.getServerSideOption('locale', req.headers.cookie || ''))),
    },
  };
}

export default Index;
